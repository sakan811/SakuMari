/*
 * SakuMari - Japanese Kana Flashcard App
 * Copyright (C) 2025  Sakan Nirattisaykul
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from "react";
import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RootLayout from "../app/layout";

// Mock the SessionProviders component
vi.mock("../components/SessionProviders", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-providers">{children}</div>
  ),
}));

// Mock next-auth/react
vi.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-session-provider">{children}</div>
  ),
}));

describe("RootLayout", () => {
  test("renders layout structure correctly", () => {
    const { container: _container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    // The layout should render the Providers component
    const providersElement = screen.getByTestId("mock-providers");
    expect(providersElement).toBeInTheDocument();
  });

  test("renders body content with correct structure", () => {
    const { container: _container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    // Check that the main content is rendered
    expect(screen.getByText("Test Content")).toBeInTheDocument();
    
    // Check that the Providers component is wrapping the content
    const providersElement = screen.getByTestId("mock-providers");
    expect(providersElement).toContainElement(screen.getByText("Test Content"));
  });

  test("renders structured data script tag with proper JSON-LD content", () => {
    const { container: _container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    const scriptElement = _container.querySelector('script[type="application/ld+json"]');
    expect(scriptElement).toBeInTheDocument();

    // Parse and validate the JSON-LD content
    const jsonLdContent = JSON.parse(scriptElement?.innerHTML || "{}");
    expect(jsonLdContent).toEqual({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "SakuMari",
      url: "https://sakumari.fukudev.org/",
      applicationCategory: "EducationalApplication",
      operatingSystem: "All",
      description:
        "A web application for learning Japanese Hiragana and Katakana characters through interactive flashcards.",
      inLanguage: "en-US",
      author: {
        "@type": "Person",
        name: "Sakan Nirattisaykul",
      },
      publisher: {
        "@type": "Organization",
        name: "SakuMari",
      },
    });
  });

  test("renders mocked Providers component wrapping children", () => {
    const { container: _container, getByTestId } = render(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>
    );

    // Check that the mocked Providers component is rendered
    const providersElement = getByTestId("mock-providers");
    expect(providersElement).toBeInTheDocument();

    // Check that the children are rendered within the Providers component
    const childElement = getByTestId("test-child");
    expect(childElement).toBeInTheDocument();
    expect(providersElement).toContainElement(childElement);
  });

  test("renders children content correctly", () => {
    const { getByText } = render(
      <RootLayout>
        <div>Test Child Content</div>
      </RootLayout>
    );

    expect(getByText("Test Child Content")).toBeInTheDocument();
  });
});