import { NextResponse, type NextRequest } from "next/server";
import { deleteAdminUser, requireAdmin } from "@/lib/admin";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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