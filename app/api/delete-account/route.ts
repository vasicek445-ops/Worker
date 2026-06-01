import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

// Validate required env vars at startup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing required Supabase environment variables for delete-account route");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function getAuthenticatedUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate the user via Bearer token
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow users to delete their own account
    const userId = user.id;

    // Stripe: smaž customera (zruší i aktivní předplatné). MUSÍ být před
    // smazáním subscriptions řádku, jinak ztratíme customer_id.
    try {
      const { data: subRow } = await supabaseAdmin
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("user_id", userId)
        .maybeSingle();
      const customerId = subRow?.stripe_customer_id;
      if (customerId) await stripe.customers.del(customerId);
    } catch (e) {
      // Nelogujeme do response (běží i tak), ale do server logu — kvůli auditu výmazu
      console.error(`delete-account: Stripe výmaz selhal pro ${userId}:`, e);
    }

    // Smaž veškerá osobní data napříč tabulkami. Každé mazání nezávisle
    // (allSettled) — pokud nějaká tabulka nemá user_id nebo neexistuje,
    // neshodí to celou operaci a účet se i tak smaže.
    const byUserId = [
      "subscriptions", "saved_documents", "job_analyses", "daily_matches",
      "transcriptions", "member_agent_config", "cancellation_feedback",
      "sent_applications", "application_replies", "applications",
      "community_posts", "community_comments", "community_upvotes",
      "community_messages", "email_oauth_tokens", "email_send_log", "agency_leads",
    ];
    const dbOps: Array<[string, PromiseLike<{ error: unknown }>]> = [
      ["profiles", supabaseAdmin.from("profiles").delete().eq("id", userId)],
      ...byUserId.map((t) => [t, supabaseAdmin.from(t).delete().eq("user_id", userId)] as [string, PromiseLike<{ error: unknown }>]),
      ["dm_messages(sender)", supabaseAdmin.from("dm_messages").delete().eq("sender_id", userId)],
      ["dm_messages(recipient)", supabaseAdmin.from("dm_messages").delete().eq("recipient_id", userId)],
    ];
    const results = await Promise.allSettled(dbOps.map(([, op]) => op));
    results.forEach((r, i) => {
      const label = dbOps[i][0];
      if (r.status === "rejected") console.error(`delete-account: výmaz ${label} selhal:`, r.reason);
      else if (r.value?.error) console.error(`delete-account: výmaz ${label} chyba:`, r.value.error);
    });

    // Best-effort smazání souborů ze Storage (avatar, CV PDF)
    await Promise.allSettled([
      supabaseAdmin.storage.from("avatars").remove([`${userId}/avatar`]),
      supabaseAdmin.storage.from("cv-pdfs").list(userId).then(({ data }) =>
        data?.length
          ? supabaseAdmin.storage.from("cv-pdfs").remove(data.map((f) => `${userId}/${f.name}`))
          : null,
      ),
    ]);

    // Smaž uživatele z auth (tohle je to klíčové — účet přestane existovat)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Chyba";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
