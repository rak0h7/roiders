import { NextResponse, type NextRequest } from "next/server";
import type { CloudModule } from "@/lib/cloudSync";
import { fetchAdminUserModules, requireAdmin, resetAdminUserModule } from "@/lib/admin";

const MODULES: CloudModule[] = ["labs", "cycle", "gym", "nutrition", "settings"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;

  try {
    const modules = await fetchAdminUserModules(id);
    return NextResponse.json({ modules });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load modules" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;
  const mod = request.nextUrl.searchParams.get("module");

  if (!mod || (mod !== "all" && !MODULES.includes(mod as CloudModule))) {
    return NextResponse.json({ error: "Invalid module" }, { status: 400 });
  }

  try {
    await resetAdminUserModule(id, mod as CloudModule | "all");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Reset failed" },
      { status: 400 }
    );
  }
}