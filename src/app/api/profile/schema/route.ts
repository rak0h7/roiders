import { NextResponse } from "next/server";
import { isMissingColumnError } from "@/lib/profile";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").select("username").limit(0);

  return NextResponse.json({
    usernames_enabled: !isMissingColumnError(error?.message),
  });
}