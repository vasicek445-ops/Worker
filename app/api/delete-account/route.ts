import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    await Promise.allSettled([
      supabaseAdmin.from("profiles").delete().eq("id", userId),
      ...byUserId.map((t) => supabaseAdmin.from(t).delete().eq("user_id", userId)),
      supabaseAdmin.from("dm_messages").delete().eq("sender_id", userId),
      supabaseAdmin.from("dm_messages").delete().eq("recipient_id", userId),
    ]);

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
