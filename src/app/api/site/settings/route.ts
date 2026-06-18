import { NextResponse } from "next/server";
import { fetchSiteSettings, toPublicSettings } from "@/lib/siteSettings";

export async function GET() {
  try {
    const settings = await fetchSiteSettings();
    return NextResponse.json(toPublicSettings(settings));
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load site settings" },
      { status: 500 }
    );
  }
}