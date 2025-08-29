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
  it("renders navigation links", async () => {
    render(<Header />);
    expect(await screen.findByText("Hiragana")).toBeDefined();
    expect(await screen.findByText("ひらがな")).toBeDefined();
    expect(await screen.findByText("Katakana")).toBeDefined();
    expect(await screen.findByText("カタカナ")).toBeDefined();
    expect(await screen.findByText("📊 Dashboard")).toBeDefined();
  });
});
