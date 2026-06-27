import { afterEach, describe, expect, it, vi } from "vitest";
import { trackEvent } from "./analytics";
import {
  IOS_INSTALL_EVENTS,
  IOS_INSTALL_PROMPT_NAME,
  instructionClickParameters
} from "./iosInstallPrompt";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("iOS install analytics", () => {
  it("sends prompt view and dismissal events to gtag", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag });

    trackEvent(IOS_INSTALL_EVENTS.view, {
      prompt_name: IOS_INSTALL_PROMPT_NAME
    });
    trackEvent(IOS_INSTALL_EVENTS.dismiss, {
      prompt_name: IOS_INSTALL_PROMPT_NAME,
      dismiss_method: "close_button"
    });

    expect(gtag).toHaveBeenNthCalledWith(1, "event", "ios_install_prompt_view", {
      prompt_name: "ios_home_screen"
    });
    expect(gtag).toHaveBeenNthCalledWith(2, "event", "ios_install_prompt_dismiss", {
      prompt_name: "ios_home_screen",
      dismiss_method: "close_button"
    });
  });

  it("sends the selected instruction step to gtag", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { gtag });

    trackEvent(
      IOS_INSTALL_EVENTS.instructionClick,
      instructionClickParameters({ number: 1, action: "share" })
    );

    expect(gtag).toHaveBeenCalledWith("event", "ios_install_instruction_click", {
      prompt_name: "ios_home_screen",
      step_number: 1,
      step_action: "share"
    });
  });
});
