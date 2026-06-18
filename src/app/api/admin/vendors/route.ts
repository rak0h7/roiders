import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createVendorAccount, fetchVendorsWithStats } from "@/lib/vendors";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const vendors = await fetchVendorsWithStats();
    return NextResponse.json({ vendors });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load vendors" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const body = (await request.json()) as {
    name?: string;
    contact_url?: string;
    key_quota?: number;
  };

  try {
    const created = await createVendorAccount({
      name: body.name ?? "",
      contact_url: body.contact_url,
      key_quota: body.key_quota,
    });

    return NextResponse.json({
      vendor: created.vendor,
      accessKey: created.accessKey,
      userId: created.userId,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create vendor" },
      { status: 400 },
    );
  }
}