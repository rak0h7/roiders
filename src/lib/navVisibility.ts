import { NAV_ITEMS, type AppRoute, type NavItem } from "@/context/NavigationContext";
import { isRouteEnabled, type SiteSettings } from "@/lib/siteSettings";

export function visibleNavItems(settings: SiteSettings): NavItem[] {
  return NAV_ITEMS.filter((item) => isRouteEnabled(settings, item.id));
}

export function firstEnabledRoute(settings: SiteSettings): AppRoute {
  return visibleNavItems(settings)[0]?.id ?? "home";
}