import type { AppRoute } from "@/context/NavigationContext";

export const ROUTE_TO_PATH: Record<AppRoute, string> = {
  home: "/",
  "bloodwork-log": "/labs/log",
  "bloodwork-insights": "/labs/analysis",
  "cycle-planner": "/cycle/builder",
  "cycle-guides": "/cycle/guides",
  "cycle-dashboard": "/cycle/simulation",
  "cycle-sources": "/cycle/sources",
  "gym-workout": "/gym/workout",
  "gym-routines": "/gym/programs",
  "gym-history": "/gym/history",
  "gym-progress": "/gym/stats",
  "gym-exercises": "/gym/exercises",
  articles: "/articles",
  settings: "/settings",
};

const PATH_TO_ROUTE = Object.fromEntries(
  Object.entries(ROUTE_TO_PATH).map(([route, path]) => [path, route as AppRoute])
) as Record<string, AppRoute>;

/** Legacy URLs that should resolve to the merged analysis page */
const LEGACY_PATH_ALIASES: Record<string, AppRoute> = {
  "/labs/archive": "bloodwork-insights",
};

export function pathFromRoute(route: AppRoute): string {
  return ROUTE_TO_PATH[route] ?? "/";
}

export function normalizePathname(pathname: string): string {
  return pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
}

/** Slug segment for `/articles/[slug]`, or null on the index route. */
export function articleSlugFromPathname(pathname: string): string | null {
  const normalized = normalizePathname(pathname);
  if (normalized === "/articles") return null;
  const prefix = "/articles/";
  if (!normalized.startsWith(prefix)) return null;
  const slug = normalized.slice(prefix.length);
  return slug.length > 0 ? slug : null;
}

export function routeFromPathname(pathname: string): AppRoute | null {
  const normalized = normalizePathname(pathname);
  if (normalized === "/articles" || normalized.startsWith("/articles/")) {
    return "articles";
  }
  return LEGACY_PATH_ALIASES[normalized] ?? PATH_TO_ROUTE[normalized] ?? null;
}