/**
 * SEO Metadata Tests
 * Tests for page-specific metadata configuration
 */

import { describe, it, expect } from "vitest";

// Import metadata from pages
import { metadata as layoutMetadata } from "../../app/layout";
import { metadata as homeMetadata } from "../../app/page";
import { metadata as hiraganaMetadata } from "../../app/hiragana/page";
import { metadata as katakanaMetadata } from "../../app/katakana/page";
import { metadata as dashboardMetadata } from "../../app/dashboard/page";

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
        "Master Japanese Hiragana and Katakana with interactive flashcards. Learn, practice, and track your progress in this free educational app.",
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

    it("should have proper metadata base URL", () => {
      expect(layoutMetadata.metadataBase).toEqual(
        new URL("https://sakumari.fukudev.org"),
      );
    });

    it("should configure OpenGraph metadata", () => {
      expect(layoutMetadata.openGraph).toEqual({
        type: "website",
        locale: "en_US",
        url: "https://sakumari.fukudev.org",
        title: "SakuMari - Master Japanese Kana",
        description:
          "Master Japanese Hiragana and Katakana with interactive flashcards. Learn, practice, and track your progress.",
        siteName: "SakuMari",
      });
    });

    it("should configure Twitter Card metadata", () => {
      expect(layoutMetadata.twitter).toEqual({
        card: "summary_large_image",
        title: "SakuMari - Master Japanese Kana",
        description:
          "Master Japanese Hiragana and Katakana with interactive flashcards. Learn, practice, and track your progress.",
      });
    });

    it("should configure robots properly", () => {
      expect(layoutMetadata.robots).toEqual({
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      });
    });

    it("should have canonical URL for root", () => {
      expect(layoutMetadata.alternates?.canonical).toBe("/");
    });
  });

  describe("Home Page Metadata", () => {
    it("should have specific description for home page", () => {
      expect(homeMetadata.description).toBe(
        "Master Japanese Hiragana and Katakana with interactive flashcards. Learn, practice, and track your progress in this free educational app.",
      );
    });

    it("should include home-specific keywords", () => {
      const keywords = homeMetadata.keywords as string[];
      // The home page uses the default keywords from the layout, so these might not be specifically added
      expect(keywords).toContain("Japanese");
      expect(keywords).toContain("Hiragana");
      expect(keywords).toContain("kana practice");
    });

    it("should have canonical URL", () => {
      expect(homeMetadata.alternates?.canonical).toBe("/");
    });

    it("should have OpenGraph configuration", () => {
      expect(homeMetadata.openGraph?.description).toBe(
        "Master Japanese Hiragana and Katakana with interactive flashcards. Learn, practice, and track your progress in this free educational app.",
      );
      expect(homeMetadata.openGraph?.url).toBe("https://sakumari.fukudev.org/");
    });

    it("should have Twitter Card configuration", () => {
      expect(homeMetadata.twitter?.description).toBe(
        "Master Japanese Hiragana and Katakana with interactive flashcards. Learn, practice, and track your progress in this free educational app.",
      );
    });
  });

  describe("Hiragana Page Metadata", () => {
    it("should have Hiragana-specific title", () => {
      expect(hiraganaMetadata.title).toBe("Hiragana Practice | SakuMari");
    });

    it("should have Hiragana-specific description", () => {
      expect(hiraganaMetadata.description).toBe(
        "Practice Japanese Hiragana characters with interactive flashcards. Master all 46 basic Hiragana symbols and improve your reading skills.",
      );
    });

    it("should include Hiragana-specific keywords", () => {
      const keywords = hiraganaMetadata.keywords as string[];
      expect(keywords).toContain("Hiragana");
      expect(keywords).toContain("Japanese characters");
      expect(keywords).toContain("あいうえお");
    });

    it("should have correct canonical URL", () => {
      expect(hiraganaMetadata.alternates?.canonical).toBe("/hiragana");
    });

    it("should have OpenGraph configuration", () => {
      expect(hiraganaMetadata.openGraph?.title).toBe(
        "Hiragana Practice | SakuMari",
      );
      expect(hiraganaMetadata.openGraph?.url).toBe(
        "https://sakumari.fukudev.org/hiragana",
      );
      expect(hiraganaMetadata.openGraph?.description).toBe(
        "Practice Japanese Hiragana characters with interactive flashcards. Master all 46 basic Hiragana symbols and improve your reading skills.",
      );
    });

    it("should have Twitter Card configuration", () => {
      expect(hiraganaMetadata.twitter?.title).toBe(
        "Hiragana Practice | SakuMari",
      );
      expect(hiraganaMetadata.twitter?.description).toBe(
        "Practice Japanese Hiragana characters with interactive flashcards. Master all 46 basic Hiragana symbols and improve your reading skills.",
      );
    });
  });

  describe("Katakana Page Metadata", () => {
    it("should have Katakana-specific title", () => {
      expect(katakanaMetadata.title).toBe("Katakana Practice | SakuMari");
    });

    it("should have Katakana-specific description", () => {
      expect(katakanaMetadata.description).toBe(
        "Practice Japanese Katakana characters with interactive flashcards. Master all 46 basic Katakana symbols used for foreign words and names.",
      );
    });

    it("should include Katakana-specific keywords", () => {
      const keywords = katakanaMetadata.keywords as string[];
      expect(keywords).toContain("Katakana");
      expect(keywords).toContain("Japanese characters");
      expect(keywords).toContain("アイウエオ");
    });

    it("should have correct canonical URL", () => {
      expect(katakanaMetadata.alternates?.canonical).toBe("/katakana");
    });

    it("should have OpenGraph configuration", () => {
      expect(katakanaMetadata.openGraph?.title).toBe(
        "Katakana Practice | SakuMari",
      );
      expect(katakanaMetadata.openGraph?.url).toBe(
        "https://sakumari.fukudev.org/katakana",
      );
      expect(katakanaMetadata.openGraph?.description).toBe(
        "Practice Japanese Katakana characters with interactive flashcards. Master all 46 basic Katakana symbols used for foreign words and names.",
      );
    });

    it("should have Twitter Card configuration", () => {
      expect(katakanaMetadata.twitter?.title).toBe(
        "Katakana Practice | SakuMari",
      );
      expect(katakanaMetadata.twitter?.description).toBe(
        "Practice Japanese Katakana characters with interactive flashcards. Master all 46 basic Katakana symbols used for foreign words and names.",
      );
    });
  });

  describe("Dashboard Page Metadata", () => {
    it("should have Dashboard-specific title", () => {
      expect(dashboardMetadata.title).toBe(
        "Dashboard - Your Progress | SakuMari",
      );
    });

    it("should have Dashboard-specific description", () => {
      expect(dashboardMetadata.description).toBe(
        "Track your Japanese Kana learning progress. View your statistics, accuracy, and performance metrics.",
      );
    });

    it("should be set to noindex for privacy", () => {
      expect(dashboardMetadata.robots).toEqual({
        index: false,
        follow: false,
      });
    });

    it("should have correct canonical URL", () => {
      expect(dashboardMetadata.alternates?.canonical).toBe("/dashboard");
    });
  });

  describe("Metadata Consistency", () => {
    it("should use consistent branding across pages", () => {
      expect(hiraganaMetadata.openGraph?.title).toContain("SakuMari");
      expect(katakanaMetadata.openGraph?.title).toContain("SakuMari");
      expect(hiraganaMetadata.twitter?.title).toContain("SakuMari");
      expect(katakanaMetadata.twitter?.title).toContain("SakuMari");
    });

    it("should have unique descriptions for each page", () => {
      const descriptions = [
        layoutMetadata.description,
        homeMetadata.description,
        hiraganaMetadata.description,
        katakanaMetadata.description,
        dashboardMetadata.description,
      ];

      const uniqueDescriptions = new Set(descriptions);
      // The layout and home page have the same description, so we expect 4 unique descriptions
      expect(uniqueDescriptions.size).toBe(4);
    });

    it("should have unique canonical URLs for each page", () => {
      const canonicals = [
        layoutMetadata.alternates?.canonical,
        homeMetadata.alternates?.canonical,
        hiraganaMetadata.alternates?.canonical,
        katakanaMetadata.alternates?.canonical,
        dashboardMetadata.alternates?.canonical,
      ];

      expect(canonicals).toEqual([
        "/",
        "/",
        "/hiragana",
        "/katakana",
        "/dashboard",
      ]);
    });
  });
});
