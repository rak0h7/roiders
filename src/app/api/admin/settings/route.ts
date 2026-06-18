import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import {
  fetchSiteSettings,
  updateSiteSettings,
  validateSiteSettingsPatch,
  type SiteSettingsPatch,
} from "@/lib/siteSettings";

export async function GET(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  try {
    const settings = await fetchSiteSettings();
    return NextResponse.json({ settings, updatedBy: user!.id });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const { user, error } = await requireAdmin(request);
  if (error) return error;

  try {
    const body = (await request.json()) as SiteSettingsPatch;
    const validationError = validateSiteSettingsPatch(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const settings = await updateSiteSettings(body, user!.id);
    return NextResponse.json({ settings });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to save settings" },
      { status: 500 }
    );
  }
}