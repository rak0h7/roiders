import { NAV_ITEMS, type AppRoute, type NavItem } from "@/context/NavigationContext";
import { isRouteEnabled, type PublicSiteSettings } from "@/lib/siteSettings";

export function isNavItemEnabled(settings: PublicSiteSettings, item: NavItem): boolean {
  return isRouteEnabled(settings, item.id);
}

export function visibleNavItems(settings: PublicSiteSettings): NavItem[] {
  return NAV_ITEMS.filter((item) => isNavItemEnabled(settings, item));
}

export function firstEnabledRoute(settings: PublicSiteSettings): AppRoute {
  const first = visibleNavItems(settings)[0];
  return first?.id ?? "home";
}