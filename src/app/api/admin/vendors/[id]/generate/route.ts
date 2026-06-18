import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { assertCanCreateAccount, fetchSiteSettings } from "@/lib/siteSettings";
import { issueVendorCustomerKey } from "@/lib/vendors";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const siteSettings = await fetchSiteSettings();
  const limitError = await assertCanCreateAccount(siteSettings);
  if (limitError) {
    return NextResponse.json({ error: limitError }, { status: 403 });
  }

  const { id } = await params;

  try {
    const created = await issueVendorCustomerKey(id);
    return NextResponse.json(created);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to generate key" },
      { status: 400 },
    );
  }
}