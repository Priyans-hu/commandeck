import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "../../../test/utils";
import TicketsView from "../TicketsView";

describe("TicketsView", () => {
  it("renders without crashing", () => {
    render(<TicketsView />);
    expect(screen.getByText(/ticket/i)).toBeInTheDocument();
  });

  it("shows mock tickets", () => {
    render(<TicketsView />);
    expect(
      screen.getByText("Fix authentication token refresh failing silently on session expiry")
    ).toBeInTheDocument();
    expect(screen.getByText("Add rate limiting to public API endpoints")).toBeInTheDocument();
    expect(
      screen.getByText("Dashboard widgets layout breaks on viewport < 1024px")
    ).toBeInTheDocument();
  });

  it('shows "AI" assign buttons', () => {
    render(<TicketsView />);
    const assignButtons = screen.getAllByTitle("Assign to AI");
    expect(assignButtons.length).toBeGreaterThan(0);
  });

  it("filter controls are present", () => {
    render(<TicketsView />);
    expect(screen.getByText("Status:")).toBeInTheDocument();
    expect(screen.getByText("Priority:")).toBeInTheDocument();
    expect(screen.getByText("Team:")).toBeInTheDocument();
  });
});
