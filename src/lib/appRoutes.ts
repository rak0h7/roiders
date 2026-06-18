import type { AppRoute } from "@/context/NavigationContext";

export const ROUTE_TO_PATH: Record<AppRoute, string> = {
  home: "/",
  "bloodwork-log": "/labs/log",
  "bloodwork-history": "/labs/archive",
  "bloodwork-insights": "/labs/analysis",
  "cycle-planner": "/cycle/builder",
  "cycle-guides": "/cycle/guides",
  "cycle-dashboard": "/cycle/simulation",
  "gym-workout": "/gym/workout",
  "gym-routines": "/gym/programs",
  "gym-history": "/gym/history",
  "gym-progress": "/gym/stats",
  "gym-exercises": "/gym/exercises",
  "nutrition-diary": "/nutrition/diary",
  "nutrition-search": "/nutrition/add",
  "nutrition-micro": "/nutrition/micro",
  "nutrition-goals": "/nutrition/goals",
  "nutrition-foods": "/nutrition/foods",
  settings: "/settings",
};

const PATH_TO_ROUTE = Object.fromEntries(
  Object.entries(ROUTE_TO_PATH).map(([route, path]) => [path, route as AppRoute])
) as Record<string, AppRoute>;

export function pathFromRoute(route: AppRoute): string {
  return ROUTE_TO_PATH[route] ?? "/";
}

export function routeFromPathname(pathname: string): AppRoute | null {
  const normalized = pathname.endsWith("/") && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;
  return PATH_TO_ROUTE[normalized] ?? null;
}