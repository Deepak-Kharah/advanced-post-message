import { EventManagerOptions } from "../eventManager/eventManager.types";
import { getErrorMessage } from "../logger";
import { ERROR_MESSAGES } from "../logger/errorMessages.constants";
import { getDefaultConfig } from "./config.default";
import { UserConfig } from "./configHandler.types";

/**
 * Class responsible for handling the configuration settings.
 */
export class Config {
  private static config: UserConfig = getDefaultConfig();

  /**
   * Replaces the current configuration with the provided partial configuration.
   * @param config - The partial configuration to replace the current configuration with.
   */
  static replace(
    config: Partial<EventManagerOptions> & { channelId?: string }
  ): void {
    updateConfig(config, this.config);
  }

  /**
   * Sets a specific configuration key to the provided value.
   * @param key - The configuration key to set.
   * @param value - The value to set for the configuration key.
   */
  static set<K extends keyof UserConfig>(key: K, value: UserConfig[K]): void {
    this.config[key] = value;
  }

  /**
   * Retrieves the value of a specific configuration key.
   * @param key - The configuration key to retrieve the value for.
   * @returns The value of the configuration key.
   */
  static get<K extends keyof UserConfig>(key: K): UserConfig[K] {
    return this.config[key];
  }

  /**
   * Retrieves all user configurations.
   * @returns {UserConfig} The user configurations.
   */
  static getAll(): UserConfig {
    return this.config;
  }

  /**
   * Resets the configuration to the default values.
   */
  static reset(): void {
    this.config = getDefaultConfig();
  }
}

/**
 * Updates the configuration object with the provided partial configuration.
 * @param userInput - The partial configuration provided by the user.
 * @param config - The current configuration object.
 */
function updateConfig(
  userInput: Partial<EventManagerOptions> & { channelId?: string },
  config: UserConfig
): void {
  config.debug = userInput.debug ?? config.debug;

  if (userInput.channelId === "") {
    throw new Error(getErrorMessage(ERROR_MESSAGES.common.channelIdRequired));
  }

  config.channelId = userInput.channelId ?? config.channelId;

  config.targetOrigin = userInput.targetOrigin ?? config.targetOrigin;

  if (userInput.target) {
    config.targetWindow = userInput.target;
  } else if (window) {
    config.targetWindow = window;
  } else {
    config.targetWindow = {
      postMessage: () => {},
    } as unknown as Window;
  }
}
