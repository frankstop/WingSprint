export const IOS_INSTALL_DISMISSED_KEY = "wingsprint-ios-install-dismissed";

export const IOS_INSTALL_EVENTS = {
  view: "ios_install_prompt_view",
  dismiss: "ios_install_prompt_dismiss",
  instructionClick: "ios_install_instruction_click"
} as const;

export const IOS_INSTALL_PROMPT_NAME = "ios_home_screen";

export type IosInstallStep = {
  number: 1 | 2 | 3;
  action: "share" | "add_to_home_screen" | "confirm_add";
};

type PromptEligibility = {
  userAgent: string;
  standalone: boolean;
  displayModeStandalone: boolean;
  dismissed: boolean;
};

type ReadStorage = Pick<Storage, "getItem">;
type WriteStorage = Pick<Storage, "setItem">;

export function isIphoneSafari(userAgent: string): boolean {
  const isIphone = /iPhone|iPod/i.test(userAgent);
  const isSafari = /Safari/i.test(userAgent);
  const isAlternateIosBrowser = /CriOS|FxiOS|EdgiOS|OPiOS/i.test(userAgent);
  return isIphone && isSafari && !isAlternateIosBrowser;
}

export function shouldShowIosInstallPrompt({
  userAgent,
  standalone,
  displayModeStandalone,
  dismissed
}: PromptEligibility): boolean {
  return isIphoneSafari(userAgent) && !standalone && !displayModeStandalone && !dismissed;
}

export function readIosInstallDismissed(storage?: ReadStorage): boolean {
  try {
    return (storage ?? window.localStorage).getItem(IOS_INSTALL_DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
}

export function writeIosInstallDismissed(storage?: WriteStorage): boolean {
  try {
    (storage ?? window.localStorage).setItem(IOS_INSTALL_DISMISSED_KEY, "true");
    return true;
  } catch {
    return false;
  }
}

export function instructionClickParameters(step: IosInstallStep) {
  return {
    prompt_name: IOS_INSTALL_PROMPT_NAME,
    step_number: step.number,
    step_action: step.action
  };
}
