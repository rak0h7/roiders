import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/env";
import { loadUserProfile } from "@/lib/profile";
import { fetchSiteSettings } from "@/lib/siteSettings";

const AUTH_ROUTES = ["/auth/login", "/auth/signup", "/api/auth"];
const PUBLIC_ROUTES = ["/maintenance"];

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isAdminRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/admin");
}

function isApiRoute(pathname: string) {
  return pathname.startsWith("/api/");
}

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isPublicSiteApi(pathname: string) {
  return pathname === "/api/site/settings";
}

export async function updateSession(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const siteSettings = await fetchSiteSettings();

  if (isPublicRoute(pathname) || isPublicSiteApi(pathname)) {
    return supabaseResponse;
  }

  if (isAdminRoute(pathname)) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/auth/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const profile = await loadUserProfile(supabase, user.id);
    if (!profile.is_admin) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return supabaseResponse;
  }

  if (siteSettings.maintenance_mode) {
    const profile = user ? await loadUserProfile(supabase, user.id) : null;
    const isAdmin = Boolean(profile?.is_admin);

    if (!isAdmin && !isAuthRoute(pathname)) {
      const maintenanceUrl = request.nextUrl.clone();
      maintenanceUrl.pathname = "/maintenance";
      maintenanceUrl.search = "";
      return NextResponse.redirect(maintenanceUrl);
    }
  }

  if (!user && !isAuthRoute(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    if (pathname !== "/") {
      loginUrl.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (user && (pathname === "/auth/login" || pathname === "/auth/signup")) {
    const profile = await loadUserProfile(supabase, user.id);
    const dest = profile.username ? "/" : "/welcome";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  if (user && !isAuthRoute(pathname) && !isApiRoute(pathname)) {
    const profile = await loadUserProfile(supabase, user.id);

    if (profile.usernames_enabled && !profile.username && pathname !== "/welcome") {
      return NextResponse.redirect(new URL("/welcome", request.url));
    }

    if (profile.usernames_enabled && profile.username && pathname === "/welcome") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (!profile.usernames_enabled && pathname === "/welcome") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return supabaseResponse;
}