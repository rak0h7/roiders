import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { revealAccessKeyFromVault } from "@/lib/accessKeyVault.server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await context.params;

  try {
    const accessKey = await revealAccessKeyFromVault(id);
    if (!accessKey) {
      return NextResponse.json(
        { error: "No escrowed key for this account (created before vault or table missing)" },
        { status: 404 },
      );
    }
    return NextResponse.json({ accessKey });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to reveal access key" },
      { status: 500 },
    );
  }
}