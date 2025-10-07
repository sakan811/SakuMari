/**
 * SEO Tests - Consolidated
 * Tests for SEO metadata, robots.txt, sitemap.xml, and integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { useSession } from "next-auth/react";
import React from "react";

// Import metadata from pages
import { metadata as layoutMetadata } from "../../app/layout";
import { metadata as homeMetadata } from "../../app/page";
import { metadata as hiraganaMetadata } from "../../app/hiragana/page";
import { metadata as katakanaMetadata } from "../../app/katakana/page";
import { metadata as dashboardMetadata } from "../../app/dashboard/page";

// Import SEO functions
import robots from "../../app/robots";
import sitemap from "../../app/sitemap";

// Import actual components for integration testing
import HomePage from "../../components/HomePage";
import FlashcardApp from "../../components/FlashcardApp";
import Dashboard from "../../components/Dashboard";

// Mock next-auth
vi.mock("next-auth/react");
const mockUseSession = vi.mocked(useSession);

// Global fetch mocking
const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve([]),
  });
});

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

// Mock components for integration testing
vi.mock("../../components/Header", () => ({
  default: () => <div data-testid="header">Header</div>,
}));

vi.mock("../../components/FlashcardProvider", () => ({
  FlashcardProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="flashcard-provider">{children}</div>
  ),
  useFlashcard: () => ({
    currentKana: null,
    kanaData: [],
    loadingKana: false,
    submitAnswer: vi.fn(),
    result: null,
    nextCard: vi.fn(),
    interactionMode: "typing",
    setInteractionMode: vi.fn(),
    choices: [],
    isSubmitting: false,
    error: null,
    clearError: vi.fn(),
    generateChoicesArray: vi.fn(),
    kanaType: "hiragana",
  }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: { alt: string }) => (
    <img alt={alt} {...props} />
  ),
}));

vi.mock("@/hooks/useDashboardData", () => ({
  useDashboardData: () => ({
    stats: [],
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/hooks/useSorting", () => ({
  useSorting: () => ({
    sortColumn: "accuracy",
    sortDirection: "asc",
    handleSort: vi.fn(),
    sortedData: (data: any) => data,
  }),
}));

describe("SEO Metadata Configuration", () => {
  describe("Root Layout Metadata", () => {
    it("should have comprehensive title configuration", () => {
      expect(layoutMetadata.title).toEqual({
        default: "SakuMari - Master Japanese Kana",
        template: "%s | SakuMari",
      });
    });

    it("should have descriptive meta description", () => {
      expect(layoutMetadata.description).toBe(
        "Master Japanese Hiragana and Katakana with interactive flashcards. Learn, practice, and track your progress in this free educational app."
      );
    });

    it("should include relevant keywords", () => {
      const keywords = layoutMetadata.keywords as string[];
      expect(keywords).toContain("Japanese");
      expect(keywords).toContain("Hiragana");
      expect(keywords).toContain("Katakana");
      expect(keywords).toContain("flashcards");
      expect(keywords).toContain("learn Japanese");
      expect(keywords).toContain("kana practice");
    });

    it("should have author information", () => {
      expect(layoutMetadata.authors).toEqual([{ name: "Sakan Nirattisaykul" }]);
      expect(layoutMetadata.creator).toBe("Sakan Nirattisaykul");
      expect(layoutMetadata.publisher).toBe("SakuMari");
    });

    it("should configure format detection properly", () => {
      expect(layoutMetadata.formatDetection).toEqual({
        email: false,
        address: false,
        telephone: false,
      });
    });

    it("should include metadataBase and alternates", () => {
      expect(layoutMetadata.metadataBase).toBeInstanceOf(URL);
      expect(layoutMetadata.alternates?.canonical).toBe("/");
    });

    it("should have proper open graph configuration", () => {
      expect(layoutMetadata.openGraph).toBeTruthy();
      expect(layoutMetadata.openGraph?.type).toBe("website");
      expect(layoutMetadata.openGraph?.locale).toBe("en_US");
      expect(layoutMetadata.openGraph?.url).toBe("https://sakumari.fukudev.org");
      expect(layoutMetadata.openGraph?.siteName).toBe("SakuMari");
    });

    it("should have twitter configuration", () => {
      expect(layoutMetadata.twitter).toBeTruthy();
      expect(layoutMetadata.twitter?.card).toBe("summary_large_image");
      expect(layoutMetadata.twitter?.title).toBe("SakuMari - Master Japanese Kana");
    });

    it("should have robots configuration", () => {
      expect(layoutMetadata.robots).toBeTruthy();
      expect(layoutMetadata.robots?.index).toBe(true);
      expect(layoutMetadata.robots?.follow).toBe(true);
    });
  });

  describe("Page-Specific Metadata", () => {
    it("should have correct home page metadata", () => {
      expect(homeMetadata.title).toBeUndefined(); // Home page uses default from layout
      expect(homeMetadata.description).toContain("Master Japanese Hiragana and Katakana");
    });

    it("should have correct hiragana page metadata", () => {
      expect(hiraganaMetadata.title).toBe("Hiragana Practice | SakuMari");
      expect(hiraganaMetadata.description).toContain("Practice Japanese Hiragana characters");
    });

    it("should have correct katakana page metadata", () => {
      expect(katakanaMetadata.title).toBe("Katakana Practice | SakuMari");
      expect(katakanaMetadata.description).toContain("Practice Japanese Katakana characters");
    });

    it("should have correct dashboard page metadata", () => {
      expect(dashboardMetadata.title).toBe("Dashboard - Your Progress");
      expect(dashboardMetadata.description).toContain("Track your Japanese Kana learning progress");
    });
  });
});

describe("Robots and Sitemap Configuration", () => {
  describe("Robots Configuration", () => {
    it("should return proper robots configuration", () => {
      const robotsConfig = robots();

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
      const rules = Array.isArray(robotsConfig.rules)
        ? robotsConfig.rules[0]
        : robotsConfig.rules;
      expect(rules.disallow).toContain("/api/");
    });

    it("should have correct sitemap URL", () => {
      const robotsConfig = robots();
      expect(robotsConfig.sitemap).toBe(
        "https://sakumari.fukudev.org/sitemap.xml"
      );
    });

    it("should allow root path for all user agents", () => {
      const robotsConfig = robots();
      const rules = Array.isArray(robotsConfig.rules)
        ? robotsConfig.rules[0]
        : robotsConfig.rules;
      expect(rules.allow).toBe("/");
    });
  });

  describe("Sitemap Configuration", () => {
    it("should generate sitemap with correct structure", () => {
      const sitemapData = sitemap();

      expect(sitemapData).toHaveLength(4); // home, dashboard, hiragana, katakana
    });

    it("should include all main pages", () => {
      const sitemapData = sitemap();
      const urls = sitemapData.map((entry: any) => entry.url);

      expect(urls).toContain("https://sakumari.fukudev.org");
      expect(urls).toContain("https://sakumari.fukudev.org/hiragana");
      expect(urls).toContain("https://sakumari.fukudev.org/katakana");
      expect(urls).toContain("https://sakumari.fukudev.org/dashboard");
    });

    it("should have proper lastModified dates", () => {
      const sitemapData = sitemap();

      sitemapData.forEach((entry: any) => {
        expect(entry.lastModified).toBeInstanceOf(Date);
      });
    });

    it("should have correct change frequencies", () => {
      const sitemapData = sitemap();
      const entryMap = new Map(sitemapData.map((entry: any) => [entry.url, entry]));

      // Home page should have higher priority and change frequency
      const homeEntry = entryMap.get("https://sakumari.fukudev.org");
      expect(homeEntry?.changeFrequency).toBe('yearly');
      expect(homeEntry?.priority).toBe(1);

      // Practice pages should have good priority
      const hiraganaEntry = entryMap.get("https://sakumari.fukudev.org/hiragana");
      expect(hiraganaEntry?.changeFrequency).toBe('weekly');
      expect(hiraganaEntry?.priority).toBe(0.5);
    });
  });
});

describe("SEO Integration Tests", () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: "test-user",
          name: "Test User",
          email: "test@example.com",
        },
        expires: "2025-12-31",
      },
      status: "authenticated",
      update: vi.fn(),
    });
  });

  it("should render HomePage with proper semantic structure", async () => {
    await act(async () => {
      render(<HomePage />);
    });

    // Check for proper headings hierarchy
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();

    // Check that the main content area is present (includes emojis)
    expect(screen.getByText("🌸 SakuMari 🌸")).toBeInTheDocument();
  });

  it("should render FlashcardApp with accessibility features", async () => {
    await act(async () => {
      render(<FlashcardApp kanaType="hiragana" />);
    });

    // FlashcardApp renders successfully with mocked provider
    expect(screen.getByTestId("flashcard-provider")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("should render Dashboard with proper structure", async () => {
    await act(async () => {
      render(<Dashboard />);
    });

    // Dashboard renders content when not loading
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Your Progress")).toBeInTheDocument();
  });

  it("should handle unauthenticated state for SEO", async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: vi.fn(),
    });

    await act(async () => {
      render(<HomePage />);
    });

    // Should still render content even when unauthenticated
    expect(screen.getByText("🌸 SakuMari 🌸")).toBeInTheDocument();
  });
});

describe("SEO Performance and Best Practices", () => {
  it("should have all required meta tags configured", () => {
    // Check for essential SEO meta tags
    expect(layoutMetadata.title).toBeDefined();
    expect(layoutMetadata.description).toBeDefined();
    expect(layoutMetadata.keywords).toBeDefined();
    expect(layoutMetadata.authors).toBeDefined();
    expect(layoutMetadata.openGraph).toBeDefined();
  });

  it("should have proper social media configuration", () => {
    const og = layoutMetadata.openGraph;
    expect(og?.title).toBeDefined();
    expect(og?.description).toBeDefined();
    expect(og?.type).toBe("website");
  });

  it("should have proper metadata structure", () => {
    expect(layoutMetadata.title).toBeDefined();
    expect(layoutMetadata.description).toBeDefined();
    expect(layoutMetadata.metadataBase).toBeInstanceOf(URL);
  });
});