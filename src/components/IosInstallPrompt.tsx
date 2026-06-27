import { useEffect, useRef, useState } from "react";
import { trackEvent } from "../analytics";
import {
  IOS_INSTALL_EVENTS,
  IOS_INSTALL_PROMPT_NAME,
  instructionClickParameters,
  readIosInstallDismissed,
  shouldShowIosInstallPrompt,
  writeIosInstallDismissed,
  type IosInstallStep
} from "../iosInstallPrompt";

const INSTALL_STEPS: ReadonlyArray<IosInstallStep & { content: React.ReactNode }> = [
  {
    number: 1,
    action: "share",
    content: <>Tap the <strong>Share</strong> button in Safari.</>
  },
  {
    number: 2,
    action: "add_to_home_screen",
    content: <>Tap <strong>Add to Home Screen</strong>.</>
  },
  {
    number: 3,
    action: "confirm_add",
    content: <>Tap <strong>Add</strong>.</>
  }
];

export function IosInstallPrompt() {
  const [visible, setVisible] = useState(false);
  const trackedView = useRef(false);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
    const eligible = shouldShowIosInstallPrompt({
      userAgent: navigator.userAgent,
      standalone: navigatorWithStandalone.standalone === true,
      displayModeStandalone: window.matchMedia("(display-mode: standalone)").matches,
      dismissed: readIosInstallDismissed()
    });

    if (!eligible) return;

    setVisible(true);
    if (!trackedView.current) {
      trackedView.current = true;
      trackEvent(IOS_INSTALL_EVENTS.view, {
        prompt_name: IOS_INSTALL_PROMPT_NAME
      });
    }
  }, []);

  useEffect(() => {
    if (visible) closeButton.current?.focus();
  }, [visible]);

  function dismiss(): void {
    trackEvent(IOS_INSTALL_EVENTS.dismiss, {
      prompt_name: IOS_INSTALL_PROMPT_NAME,
      dismiss_method: "close_button"
    });
    writeIosInstallDismissed();
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="ios-install-prompt"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <section
        className="ios-install-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ios-install-title"
        aria-describedby="ios-install-description"
      >
        <button
          ref={closeButton}
          className="ios-install-close"
          type="button"
          aria-label="Dismiss iPhone installation instructions"
          onClick={dismiss}
        >
          ×
        </button>

        <h2 id="ios-install-title">ADD WINGSPRINT TO YOUR IPHONE</h2>
        <p id="ios-install-description">
          For the best experience, install this as a Home Screen app.
        </p>

        <ol className="ios-install-steps">
          {INSTALL_STEPS.map((step) => (
            <li
              key={step.number}
              onClick={() => {
                trackEvent(
                  IOS_INSTALL_EVENTS.instructionClick,
                  instructionClickParameters(step)
                );
              }}
            >
              <span>{step.content}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
