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

    // Delete profile data
    await supabaseAdmin.from("profiles").delete().eq("id", userId);

    // Delete community posts
    await supabaseAdmin.from("community_posts").delete().eq("user_id", userId);

    // Delete community comments
    await supabaseAdmin.from("community_comments").delete().eq("user_id", userId);

    // Delete community upvotes
    await supabaseAdmin.from("community_upvotes").delete().eq("user_id", userId);

    // Delete user from auth
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Chyba";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
