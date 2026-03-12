import { describe, it, expect, beforeEach } from "vitest";
import { useSettingsStore } from "../settingsStore";

describe("settingsStore", () => {
  beforeEach(() => {
    useSettingsStore.setState({
      githubToken: "",
      linearApiKey: "",
      slackBotToken: "",
      connections: {
        github: "disconnected",
        linear: "disconnected",
        slack: "disconnected",
      },
      notifications: {
        permissionGranted: false,
        pr: true,
        ticket: true,
        aiSessionComplete: true,
        aiSessionFailure: true,
        slack: false,
      },
      appearance: {
        theme: "dark",
        density: "comfortable",
        viewMode: "ic",
      },
      aiConfig: {
        model: "claude-opus-4-6",
        autoPush: false,
        autoCreatePR: false,
        systemPrompt: "",
        repoPath: "",
      },
    });
  });

  it("has correct initial state", () => {
    const state = useSettingsStore.getState();
    expect(state.githubToken).toBe("");
    expect(state.linearApiKey).toBe("");
    expect(state.connections.github).toBe("disconnected");
    expect(state.notifications.pr).toBe(true);
    expect(state.appearance.theme).toBe("dark");
  });

  it("can update github token", () => {
    useSettingsStore.getState().setGithubToken("ghp_test123");
    expect(useSettingsStore.getState().githubToken).toBe("ghp_test123");
  });

  it("can update linear API key", () => {
    useSettingsStore.getState().setLinearApiKey("lin_api_test456");
    expect(useSettingsStore.getState().linearApiKey).toBe("lin_api_test456");
  });

  it("can toggle notification settings", () => {
    expect(useSettingsStore.getState().notifications.pr).toBe(true);

    useSettingsStore.getState().setNotificationPreference("pr", false);
    expect(useSettingsStore.getState().notifications.pr).toBe(false);

    useSettingsStore.getState().setNotificationPreference("pr", true);
    expect(useSettingsStore.getState().notifications.pr).toBe(true);
  });

  it("can update AI config", () => {
    useSettingsStore.getState().setAiModel("claude-sonnet-4-6");
    expect(useSettingsStore.getState().aiConfig.model).toBe("claude-sonnet-4-6");

    useSettingsStore.getState().setAutoPush(true);
    expect(useSettingsStore.getState().aiConfig.autoPush).toBe(true);
  });

  it("can update appearance settings", () => {
    useSettingsStore.getState().setDensity("compact");
    expect(useSettingsStore.getState().appearance.density).toBe("compact");

    useSettingsStore.getState().setViewMode("lead");
    expect(useSettingsStore.getState().appearance.viewMode).toBe("lead");
  });
});
