/**
 * SEO Files Tests
 * Tests for robots.ts and sitemap.ts files to ensure proper SEO configuration
 */

import { describe, it, expect } from "vitest";

// Import the functions to test
import robots from "../../app/robots";
import sitemap from "../../app/sitemap";

describe("Robots Configuration", () => {
  it("should return proper robots configuration", () => {
    const robotsConfig = robots();

    // Test the structure of the robots configuration
    expect(robotsConfig).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      sitemap: "https://sakumari.fukudev.org/sitemap.xml",
    });
  });

  it("should have correct disallow rules for API routes", () => {
    const robotsConfig = robots();

    // Test that API routes are properly disallowed
    // Type assertion to handle the union type from MetadataRoute.Robots
    const rules = Array.isArray(robotsConfig.rules)
      ? robotsConfig.rules[0]
      : robotsConfig.rules;
    expect(rules.disallow).toContain("/api/");
  });

  it("should have correct sitemap URL", () => {
    const robotsConfig = robots();

    // Test that the sitemap URL is correct
    expect(robotsConfig.sitemap).toBe(
      "https://sakumari.fukudev.org/sitemap.xml",
    );
  });

  it("should allow root path for all user agents", () => {
    const robotsConfig = robots();

    // Test that root path is allowed for all user agents
    // Type assertion to handle the union type from MetadataRoute.Robots
    const rules = Array.isArray(robotsConfig.rules)
      ? robotsConfig.rules[0]
      : robotsConfig.rules;
    expect(rules.userAgent).toBe("*");
    expect(rules.allow).toBe("/");
  });
});

describe("Sitemap Configuration", () => {
  it("should return proper sitemap configuration", () => {
    const sitemapConfig = sitemap();

    // Test that sitemap returns an array
    expect(Array.isArray(sitemapConfig)).toBe(true);

    // Test that all expected URLs are included
    const urls = sitemapConfig.map((entry) => entry.url);
    expect(urls).toContain("https://sakumari.fukudev.org");
    expect(urls).toContain("https://sakumari.fukudev.org/dashboard");
    expect(urls).toContain("https://sakumari.fukudev.org/hiragana");
    expect(urls).toContain("https://sakumari.fukudev.org/katakana");
  });

  it("should have correct baseUrl configuration", () => {
    // This test covers lines 21-23 in sitemap.ts
    const sitemapConfig = sitemap();

    // Test that the baseUrl is correctly defined and used
    expect(sitemapConfig[0].url).toBe("https://sakumari.fukudev.org");
    expect(sitemapConfig[1].url).toBe("https://sakumari.fukudev.org/dashboard");
  });

  it("should have proper metadata for each sitemap entry", () => {
    const sitemapConfig = sitemap();

    // Test home page entry
    const homeEntry = sitemapConfig.find(
      (entry) => entry.url === "https://sakumari.fukudev.org",
    );
    expect(homeEntry).toBeDefined();
    expect(homeEntry?.changeFrequency).toBe("yearly");
    expect(homeEntry?.priority).toBe(1);
    expect(homeEntry?.lastModified).toBeInstanceOf(Date);

    // Test dashboard entry
    const dashboardEntry = sitemapConfig.find(
      (entry) => entry.url === "https://sakumari.fukudev.org/dashboard",
    );
    expect(dashboardEntry).toBeDefined();
    expect(dashboardEntry?.changeFrequency).toBe("monthly");
    expect(dashboardEntry?.priority).toBe(0.8);
    expect(dashboardEntry?.lastModified).toBeInstanceOf(Date);

    // Test hiragana entry
    const hiraganaEntry = sitemapConfig.find(
      (entry) => entry.url === "https://sakumari.fukudev.org/hiragana",
    );
    expect(hiraganaEntry).toBeDefined();
    expect(hiraganaEntry?.changeFrequency).toBe("weekly");
    expect(hiraganaEntry?.priority).toBe(0.5);
    expect(hiraganaEntry?.lastModified).toBeInstanceOf(Date);

    // Test katakana entry
    const katakanaEntry = sitemapConfig.find(
      (entry) => entry.url === "https://sakumari.fukudev.org/katakana",
    );
    expect(katakanaEntry).toBeDefined();
    expect(katakanaEntry?.changeFrequency).toBe("weekly");
    expect(katakanaEntry?.priority).toBe(0.5);
    expect(katakanaEntry?.lastModified).toBeInstanceOf(Date);
  });

  it("should have consistent baseUrl usage across all entries", () => {
    const sitemapConfig = sitemap();
    const baseUrl = "https://sakumari.fukudev.org";

    // Test that all URLs use the same baseUrl
    sitemapConfig.forEach((entry) => {
      expect(entry.url).toContain(baseUrl);
    });
  });

  it("should have appropriate priority values", () => {
    const sitemapConfig = sitemap();

    // Test that priorities are within valid range (0.0 to 1.0)
    sitemapConfig.forEach((entry) => {
      expect(entry.priority).toBeGreaterThanOrEqual(0);
      expect(entry.priority).toBeLessThanOrEqual(1);
    });

    // Test that home page has highest priority
    const homeEntry = sitemapConfig.find(
      (entry) => entry.url === "https://sakumari.fukudev.org",
    );
    expect(homeEntry?.priority).toBe(1);

    // Test that dashboard has second highest priority
    const dashboardEntry = sitemapConfig.find(
      (entry) => entry.url === "https://sakumari.fukudev.org/dashboard",
    );
    expect(dashboardEntry?.priority).toBe(0.8);

    // Test that practice pages have lower priority
    const hiraganaEntry = sitemapConfig.find(
      (entry) => entry.url === "https://sakumari.fukudev.org/hiragana",
    );
    const katakanaEntry = sitemapConfig.find(
      (entry) => entry.url === "https://sakumari.fukudev.org/katakana",
    );
    expect(hiraganaEntry?.priority).toBe(0.5);
    expect(katakanaEntry?.priority).toBe(0.5);
  });
});
