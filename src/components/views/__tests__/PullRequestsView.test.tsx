import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../../../test/utils";
import PullRequestsView from "../PullRequestsView";

describe("PullRequestsView", () => {
  it("renders without crashing", () => {
    render(<PullRequestsView />);
    expect(screen.getByText("My PRs")).toBeInTheDocument();
  });

  it("shows tab switcher (My PRs / Review Requested)", () => {
    render(<PullRequestsView />);
    expect(screen.getByText("My PRs")).toBeInTheDocument();
    expect(screen.getByText("Review Requested")).toBeInTheDocument();
  });

  it("shows mock PRs", () => {
    render(<PullRequestsView />);
    expect(
      screen.getByText("feat: add OAuth2 PKCE flow for GitHub integration")
    ).toBeInTheDocument();
    expect(
      screen.getByText("fix: resolve race condition in WebSocket reconnection logic")
    ).toBeInTheDocument();
  });

  it("shows review buttons", async () => {
    const user = userEvent.setup();
    render(<PullRequestsView />);

    // Switch to Review Requested tab
    await user.click(screen.getByText("Review Requested"));

    // Review buttons should be present
    const reviewButtons = screen.getAllByText("Review");
    expect(reviewButtons.length).toBeGreaterThan(0);
  });
});
