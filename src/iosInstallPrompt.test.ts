import { describe, expect, it } from "vitest";
import {
  IOS_INSTALL_DISMISSED_KEY,
  instructionClickParameters,
  isIphoneSafari,
  readIosInstallDismissed,
  shouldShowIosInstallPrompt,
  writeIosInstallDismissed
} from "./iosInstallPrompt";

const IPHONE_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 " +
  "(KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1";

describe("iOS install prompt", () => {
  it("recognizes iPhone Safari and excludes alternate iOS browsers", () => {
    expect(isIphoneSafari(IPHONE_SAFARI)).toBe(true);
    expect(isIphoneSafari(IPHONE_SAFARI.replace("Version/18.5", "CriOS/137.0"))).toBe(false);
    expect(isIphoneSafari(IPHONE_SAFARI.replace("Version/18.5", "FxiOS/139.0"))).toBe(false);
    expect(isIphoneSafari("Mozilla/5.0 (Macintosh) Version/18.5 Safari/605.1.15")).toBe(false);
  });

  it("shows only outside standalone mode before dismissal", () => {
    const base = {
      userAgent: IPHONE_SAFARI,
      standalone: false,
      displayModeStandalone: false,
      dismissed: false
    };

    expect(shouldShowIosInstallPrompt(base)).toBe(true);
    expect(shouldShowIosInstallPrompt({ ...base, standalone: true })).toBe(false);
    expect(shouldShowIosInstallPrompt({ ...base, displayModeStandalone: true })).toBe(false);
    expect(shouldShowIosInstallPrompt({ ...base, dismissed: true })).toBe(false);
  });

  it("persists dismissal and tolerates unavailable storage", () => {
    const data = new Map<string, string>();
    const storage = {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value)
    };

    expect(readIosInstallDismissed(storage)).toBe(false);
    expect(writeIosInstallDismissed(storage)).toBe(true);
    expect(data.get(IOS_INSTALL_DISMISSED_KEY)).toBe("true");
    expect(readIosInstallDismissed(storage)).toBe(true);

    const unavailable = {
      getItem: () => {
        throw new Error("unavailable");
      },
      setItem: () => {
        throw new Error("unavailable");
      }
    };
    expect(readIosInstallDismissed(unavailable)).toBe(false);
    expect(writeIosInstallDismissed(unavailable)).toBe(false);
  });

  it("builds stable analytics parameters for instruction clicks", () => {
    expect(instructionClickParameters({ number: 2, action: "add_to_home_screen" })).toEqual({
      prompt_name: "ios_home_screen",
      step_number: 2,
      step_action: "add_to_home_screen"
    });
  });
});
