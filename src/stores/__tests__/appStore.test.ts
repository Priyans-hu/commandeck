import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "../appStore";
import type { Notification } from "../../types";

describe("appStore", () => {
  beforeEach(() => {
    useAppStore.setState({
      sidebarCollapsed: false,
      viewMode: "ic",
      activeTab: "inbox",
      notifications: [],
    });
  });

  it("has correct initial state", () => {
    const state = useAppStore.getState();
    expect(state.sidebarCollapsed).toBe(false);
    expect(state.viewMode).toBe("ic");
    expect(state.activeTab).toBe("inbox");
    expect(state.notifications).toEqual([]);
  });

  it("toggleSidebar works", () => {
    expect(useAppStore.getState().sidebarCollapsed).toBe(false);

    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().sidebarCollapsed).toBe(true);

    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().sidebarCollapsed).toBe(false);
  });

  it("setViewMode works", () => {
    useAppStore.getState().setViewMode("lead");
    expect(useAppStore.getState().viewMode).toBe("lead");

    useAppStore.getState().setViewMode("ic");
    expect(useAppStore.getState().viewMode).toBe("ic");
  });

  it("addNotification works", () => {
    const notification: Notification = {
      id: "n1",
      type: "pr",
      title: "New PR",
      message: "A new PR was opened",
      read: false,
      createdAt: "2026-03-12T10:00:00Z",
    };

    useAppStore.getState().addNotification(notification);

    const notifications = useAppStore.getState().notifications;
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toEqual(notification);
  });
});
