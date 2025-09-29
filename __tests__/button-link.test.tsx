import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ButtonLink } from "../components/ui/ButtonLink";

// Mock next/link to avoid actual Link component in tests
vi.mock("next/link", () => {
  return {
    default: ({ children, href, className, ...props }) => (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    ),
  };
});

describe("ButtonLink", () => {
  it("renders an anchor tag when external=true", () => {
    render(
      <ButtonLink href="https://example.com" external={true}>
        External Link
      </ButtonLink>,
    );

    const link = screen.getByText("External Link");
    expect(link.tagName).toBe("A");
  });

  it("renders with correct attributes for external links", () => {
    render(
      <ButtonLink href="https://example.com" external={true}>
        External Link
      </ButtonLink>,
    );

    const link = screen.getByText("External Link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("passes href correctly to external links", () => {
    render(
      <ButtonLink href="https://example.com" external={true}>
        External Link
      </ButtonLink>,
    );

    const link = screen.getByText("External Link");
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("renders children correctly for external links", () => {
    render(
      <ButtonLink href="https://example.com" external={true}>
        External Link Content
      </ButtonLink>,
    );

    expect(screen.getByText("External Link Content")).toBeInTheDocument();
  });

  it("applies custom className to external links", () => {
    render(
      <ButtonLink
        href="https://example.com"
        external={true}
        className="custom-class"
      >
        External Link
      </ButtonLink>,
    );

    const link = screen.getByText("External Link");
    expect(link).toHaveClass("custom-class");
  });

  it("handles additional props for external links", () => {
    render(
      <ButtonLink
        href="https://example.com"
        external={true}
        aria-label="Custom label"
        data-testid="custom-link"
      >
        External Link
      </ButtonLink>,
    );

    const link = screen.getByTestId("custom-link");
    expect(link).toHaveAttribute("aria-label", "Custom label");
  });

  it("applies variant styles correctly for external links", () => {
    render(
      <ButtonLink href="https://example.com" external={true} variant="ghost">
        Ghost External Link
      </ButtonLink>,
    );

    const link = screen.getByText("Ghost External Link");
    expect(link).toHaveClass("bg-transparent");
    expect(link).toHaveClass("text-[#d1622b]");
  });

  it("applies size styles correctly for external links", () => {
    render(
      <ButtonLink href="https://example.com" external={true} size="sm">
        Small External Link
      </ButtonLink>,
    );

    const link = screen.getByText("Small External Link");
    expect(link).toHaveClass("px-3");
    expect(link).toHaveClass("py-2");
    expect(link).toHaveClass("text-sm");
  });

  it("applies fullWidth styles correctly for external links", () => {
    render(
      <ButtonLink href="https://example.com" external={true} fullWidth={true}>
        Full Width External Link
      </ButtonLink>,
    );

    const link = screen.getByText("Full Width External Link");
    expect(link).toHaveClass("w-full");
    expect(link).toHaveClass("text-center");
  });

  it("applies animation styles correctly for external links", () => {
    render(
      <ButtonLink href="https://example.com" external={true} animation="scale">
        Animated External Link
      </ButtonLink>,
    );

    const link = screen.getByText("Animated External Link");
    expect(link).toHaveClass("transform");
    expect(link).toHaveClass("hover:scale-105");
  });
});
