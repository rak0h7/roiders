import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

type SessionTokens = {
  access_token: string;
  refresh_token: string;
};

export async function jsonWithSession(
  request: NextRequest,
  session: SessionTokens,
  body: Record<string, unknown>
): Promise<NextResponse> {
  const response = NextResponse.json({
    ...body,
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.setSession(session);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return response;
}