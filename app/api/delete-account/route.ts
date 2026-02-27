import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

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
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Chyba" }, { status: 500 });
  }
}
