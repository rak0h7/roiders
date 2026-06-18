import { describe, expect, it } from "vitest";
import { pathFromRoute, routeFromPathname } from "./appRoutes";

describe("appRoutes", () => {
  it("maps routes to paths and back", () => {
    expect(pathFromRoute("cycle-planner")).toBe("/cycle/builder");
    expect(routeFromPathname("/cycle/builder")).toBe("cycle-planner");
  });

  it("maps home to root", () => {
    expect(pathFromRoute("home")).toBe("/");
    expect(routeFromPathname("/")).toBe("home");
  });

  it("returns null for unknown paths", () => {
    expect(routeFromPathname("/unknown")).toBeNull();
  });
});