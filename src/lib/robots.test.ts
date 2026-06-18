import { describe, expect, it } from "vitest";
import {
  AI_CRAWLER_USER_AGENTS,
  PUBLIC_ALLOW_PATHS,
  PRIVATE_DISALLOW_PATHS,
  SEARCH_CRAWLER_USER_AGENTS,
  buildRobotsMetadata,
} from "./robots";

describe("robots", () => {
  it("allows public marketing pages and blocks private app surfaces", () => {
    const { rules } = buildRobotsMetadata();
    const wildcard = Array.isArray(rules) ? rules[0] : rules;

    expect(wildcard.allow).toEqual(expect.arrayContaining([...PUBLIC_ALLOW_PATHS]));
    expect(wildcard.disallow).toEqual(expect.arrayContaining([...PRIVATE_DISALLOW_PATHS]));
    expect(wildcard.disallow).toContain("/labs/");
    expect(wildcard.disallow).toContain("/api/");
    expect(wildcard.allow).toContain("/features/");
  });

  it("explicitly permits major search and AI crawlers", () => {
    const { rules } = buildRobotsMetadata();
    const ruleList = Array.isArray(rules) ? rules : [rules];

    const agents = ruleList.flatMap((rule) =>
      Array.isArray(rule.userAgent) ? rule.userAgent : [rule.userAgent ?? "*"]
    );

    for (const bot of ["Googlebot", "Bingbot", "GPTBot", "ClaudeBot", "PerplexityBot"]) {
      expect(agents).toContain(bot);
    }

    expect(agents).toEqual(expect.arrayContaining([...SEARCH_CRAWLER_USER_AGENTS]));
    expect(agents).toEqual(expect.arrayContaining([...AI_CRAWLER_USER_AGENTS]));
  });

  it("points crawlers at the canonical host and sitemap", () => {
    const meta = buildRobotsMetadata();

    expect(meta.host).toBe("roiders.club");
    expect(meta.sitemap).toBe("https://roiders.club/sitemap.xml");
  });
});