import { NextResponse, type NextRequest } from "next/server";
import { fetchAdminUsers, requireAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const users = await fetchAdminUsers();
    return NextResponse.json({ users });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load users" },
      { status: 500 }
    );
  }
}