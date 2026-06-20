import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createAccessKeyAccount } from "@/lib/createAccessKeyAccount";
import { assertCanCreateAccount, fetchSiteSettings } from "@/lib/siteSettings";

export async function POST(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const siteSettings = await fetchSiteSettings();
  const limitError = await assertCanCreateAccount(siteSettings);
  if (limitError) {
    return NextResponse.json({ error: limitError }, { status: 403 });
  }

  try {
    const created = await createAccessKeyAccount({ issuedByUserId: user!.id });
    return NextResponse.json({
      accessKey: created.accessKey,
      userId: created.userId,
      keyFingerprint: created.keyFingerprint,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to generate account" },
      { status: 500 }
    );
  }
}