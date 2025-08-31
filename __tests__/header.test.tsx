import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "../components/Header";

vi.mock("next/link", () => {
  return {
    default: ({ children, href }) => <a href={href}>{children}</a>,
  };
});

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { id: "user123", name: "Test User" } },
    status: "authenticated",
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

describe("Header", () => {
  it("renders navigation links", () => {
    render(<Header />);
    expect(screen.getByText("Hiragana")).toBeDefined();
    expect(screen.getByText("ひらがな")).toBeDefined();
    expect(screen.getByText("Katakana")).toBeDefined();
    expect(screen.getByText("カタカナ")).toBeDefined();
    expect(screen.getByText("📊 Dashboard")).toBeDefined();
  });
});
