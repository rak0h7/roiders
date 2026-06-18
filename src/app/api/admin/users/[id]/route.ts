import { NextResponse, type NextRequest } from "next/server";
import { deleteAdminUser, requireAdmin, setAdminUserPremiumSync } from "@/lib/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;
  const body = (await request.json()) as { premium_sync_enabled?: boolean };

  if (typeof body.premium_sync_enabled !== "boolean") {
    return NextResponse.json({ error: "premium_sync_enabled must be a boolean" }, { status: 400 });
  }

  try {
    await setAdminUserPremiumSync(id, body.premium_sync_enabled);
    return NextResponse.json({ ok: true, premium_sync_enabled: body.premium_sync_enabled });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Update failed" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;

  try {
    await deleteAdminUser(user!, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Delete failed" },
      { status: 400 }
    );
  }
}