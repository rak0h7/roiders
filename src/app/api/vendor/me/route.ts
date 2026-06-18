import { NextResponse, type NextRequest } from "next/server";
import { requireVendorOrAdmin } from "@/lib/admin";
import {
  fetchVendorByProfileId,
  fetchVendorCustomers,
  vendorKeysRemaining,
} from "@/lib/vendors";

export async function GET(request: NextRequest) {
  const { user, isAdmin, isVendor, error } = await requireVendorOrAdmin(request);
  if (error) return error;

  try {
    const vendor = await fetchVendorByProfileId(user!.id);
    if (!vendor) {
      return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
    }

    const customers = await fetchVendorCustomers(vendor.id);

    return NextResponse.json({
      vendor,
      keys_remaining: vendorKeysRemaining(vendor),
      customers,
      is_admin: isAdmin,
      is_vendor: isVendor,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load vendor data" },
      { status: 500 },
    );
  }
}