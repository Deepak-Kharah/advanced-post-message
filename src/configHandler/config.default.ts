import { UserConfig } from "@configHandler/configHandler.types";
import { ANY_ORIGIN } from "@eventManager/eventManager.constant";

export function getDefaultConfig(): UserConfig {
  return {
    targetOrigin: ANY_ORIGIN,
    targetWindow: {
      postMessage: () => {},
    } as unknown as Window,
    debug: false,
    channelId: "",
  };
}
