import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import Providers from "@/components/SessionProviders";

// Mock SessionProvider
vi.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="session-provider">{children}</div>
  ),
}));

describe("Session Provider", () => {
  test("wraps children with SessionProvider", () => {
    render(
      <Providers>
        <div>Test Content</div>
      </Providers>,
    );

    expect(screen.getByTestId("session-provider")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  test("provides session context to nested components", () => {
    const TestComponent = () => {
      return <div>Nested Component</div>;
    };

    render(
      <Providers>
        <TestComponent />
      </Providers>,
    );

    expect(screen.getByText("Nested Component")).toBeInTheDocument();
  });
});
