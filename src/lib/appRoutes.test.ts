import { describe, expect, it } from "vitest";
import { articleSlugFromPathname, pathFromRoute, routeFromPathname } from "./appRoutes";

describe("appRoutes", () => {
  it("maps routes to paths and back", () => {
    expect(pathFromRoute("cycle-planner")).toBe("/cycle/builder");
    expect(routeFromPathname("/cycle/builder")).toBe("cycle-planner");
  });

  it("maps home to root", () => {
    expect(pathFromRoute("home")).toBe("/");
    expect(routeFromPathname("/")).toBe("home");
  });

  it("maps articles index and detail paths", () => {
    expect(pathFromRoute("articles")).toBe("/articles");
    expect(routeFromPathname("/articles")).toBe("articles");
    expect(routeFromPathname("/articles/why-cut-what-to-expect")).toBe("articles");
    expect(articleSlugFromPathname("/articles")).toBeNull();
    expect(articleSlugFromPathname("/articles/why-cut-what-to-expect")).toBe("why-cut-what-to-expect");
  });

  it("returns null for unknown paths", () => {
    expect(routeFromPathname("/unknown")).toBeNull();
  });

  it("maps legacy archive path to analysis", () => {
    expect(routeFromPathname("/labs/archive")).toBe("bloodwork-insights");
  });
});