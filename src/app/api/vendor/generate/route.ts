import { NextResponse, type NextRequest } from "next/server";
import { requireVendorOrAdmin } from "@/lib/admin";
import { assertCanCreateAccount, fetchSiteSettings } from "@/lib/siteSettings";
import {
  assertVendorCanIssue,
  fetchVendorByProfileId,
  issueVendorCustomerKey,
} from "@/lib/vendors";

export async function POST(request: NextRequest) {
  const { user, isAdmin, error } = await requireVendorOrAdmin(request);
  if (error) return error;

  const siteSettings = await fetchSiteSettings();
  const limitError = await assertCanCreateAccount(siteSettings);
  if (limitError) {
    return NextResponse.json({ error: limitError }, { status: 403 });
  }

  try {
    const vendor = await fetchVendorByProfileId(user!.id);
    if (!vendor) {
      return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
    }

    if (!isAdmin) {
      const quotaError = assertVendorCanIssue(vendor);
      if (quotaError) {
        return NextResponse.json({ error: quotaError }, { status: 403 });
      }
    }

    const created = await issueVendorCustomerKey(vendor.id);
    return NextResponse.json(created);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to generate key" },
      { status: 400 },
    );
  }
}