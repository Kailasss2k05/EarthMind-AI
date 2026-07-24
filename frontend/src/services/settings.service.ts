import { get, put } from "./api";
import { SettingsResponse } from "./types";

export const settingsService = {
  getSettings: () => get<SettingsResponse>("/settings"),
  updateSettings: (settings: SettingsResponse) => put<SettingsResponse>("/settings", settings),
};
