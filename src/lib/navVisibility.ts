import { NAV_ITEMS, type AppRoute, type NavItem } from "@/context/NavigationContext";
import { isRouteEnabled, type PublicSiteSettings } from "@/lib/siteSettings";

export function visibleNavItems(settings: PublicSiteSettings): NavItem[] {
  return NAV_ITEMS.filter((item) => isRouteEnabled(settings, item.id));
}

export function firstEnabledRoute(settings: PublicSiteSettings): AppRoute {
  return visibleNavItems(settings)[0]?.id ?? "home";
}