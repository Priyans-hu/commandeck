import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../../../test/utils";
import Sidebar from "../Sidebar";
import { useAppStore } from "../../../stores/appStore";

describe("Sidebar", () => {
  beforeEach(() => {
    useAppStore.setState({ sidebarCollapsed: false });
  });

  it("renders without crashing", () => {
    render(<Sidebar />);
    expect(screen.getByRole("complementary")).toBeInTheDocument();
  });

  it('shows app name "CommanDeck"', () => {
    render(<Sidebar />);
    expect(screen.getByText("CommanDeck")).toBeInTheDocument();
  });

  it("has all navigation links", () => {
    render(<Sidebar />);
    expect(screen.getByText("Inbox")).toBeInTheDocument();
    expect(screen.getByText("Tickets")).toBeInTheDocument();
    expect(screen.getByText("Pull Requests")).toBeInTheDocument();
    expect(screen.getByText("AI Sessions")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("toggles collapsed state", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    // App name should be visible initially
    expect(screen.getByText("CommanDeck")).toBeInTheDocument();

    // Click the collapse button
    const collapseButton = screen.getByText("Collapse").closest("button")!;
    await user.click(collapseButton);

    // After collapse, app name should be hidden
    expect(screen.queryByText("CommanDeck")).not.toBeInTheDocument();
  });
});
