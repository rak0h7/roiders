import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSessionClient } from "@/lib/admin";
import { normalizeUsername, validateUsername } from "@/lib/username";

export async function GET(request: NextRequest) {
  const username = normalizeUsername(request.nextUrl.searchParams.get("q") ?? "");
  const validationError = validateUsername(username);
  if (validationError) {
    return NextResponse.json({ available: false, error: validationError });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const supabase = createSessionClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const takenByOther = Boolean(data && data.id !== user?.id);
  return NextResponse.json({ available: !takenByOther, username });
}

export async function PATCH(request: NextRequest) {
  const supabase = createSessionClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { username?: string };
  const username = normalizeUsername(body.username ?? "");
  const validationError = validateUsername(username);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: taken, error: takenError } = await admin
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (takenError) {
    return NextResponse.json({ error: takenError.message }, { status: 500 });
  }

  if (taken && taken.id !== user.id) {
    return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      username,
      display_name: username,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateError) {
    if (updateError.code === "23505") {
      return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
    }
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ username });
}