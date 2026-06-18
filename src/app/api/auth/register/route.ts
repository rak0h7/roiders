import { NextResponse, type NextRequest } from "next/server";
import { createAccessKeyAccount } from "@/lib/createAccessKeyAccount";
import { isAuthServerConfigured } from "@/lib/supabase/env";
import { jsonWithSession } from "@/lib/supabase/route";
import { assertCanCreateAccount, fetchSiteSettings } from "@/lib/siteSettings";

export async function POST(request: NextRequest) {
  if (!isAuthServerConfigured()) {
    return NextResponse.json({ error: "Auth server is not configured" }, { status: 503 });
  }

  const siteSettings = await fetchSiteSettings();
  if (!siteSettings.allow_public_signup) {
    return NextResponse.json(
      { error: "Public signup is disabled. Contact the site owner for an access key." },
      { status: 403 }
    );
  }

  if (siteSettings.maintenance_mode) {
    return NextResponse.json(
      { error: "Signup is unavailable while the site is in maintenance mode." },
      { status: 503 }
    );
  }

  const limitError = await assertCanCreateAccount(siteSettings);
  if (limitError) {
    return NextResponse.json({ error: limitError }, { status: 403 });
  }

  try {
    const created = await createAccessKeyAccount();
    return jsonWithSession(request, created.session, { accessKey: created.accessKey });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Account creation failed" },
      { status: 500 }
    );
  }
}