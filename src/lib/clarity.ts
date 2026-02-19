import Clarity from "@microsoft/clarity";

/** Set a custom tag on the current Clarity session */
export function clarityTag(key: string, value: string) {
  try {
    Clarity.setTag(key, value);
  } catch {
    // Clarity not initialized (e.g. local dev)
  }
}

/** Fire a custom Clarity event */
export function clarityEvent(name: string) {
  try {
    Clarity.event(name);
  } catch {
    // Clarity not initialized
  }
}

/** Identify a logged-in user */
export function clarityIdentify(userId: string, friendlyName?: string) {
  try {
    Clarity.identify(userId, undefined, undefined, friendlyName);
  } catch {
    // Clarity not initialized
  }
}
