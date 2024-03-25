import { ANY_ORIGIN } from "../eventManager/eventManager.constant";
import { UserConfig } from "./configHandler.types";

export function getDefaultConfig(): UserConfig {
  return {
    targetOrigin: ANY_ORIGIN,
    targetWindow: {
      postMessage: () => {},
    } as unknown as Window,
    debug: false,
    channelId: "",
    suppressErrors: false,
  };
}
