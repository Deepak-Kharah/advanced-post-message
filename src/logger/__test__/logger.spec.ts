import { Config } from "../../configHandler";
import { EVENT_MANAGER_NAME } from "../../eventManager/eventManager.constant";
import { Logger, getErrorMessage } from "../logger";

describe("Logger", () => {
  let logger: Logger;
  let config: Config;
  const TEST_MESSAGE = "test message";

  beforeEach(() => {
    config = new Config();

    config.set("targetOrigin", "https://example-target-origin.com");
    config.set("targetWindow", window);
    config.set("debug", false);

    logger = new Logger(config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should log a message with the prefix", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    logger.log(TEST_MESSAGE);

    expect(consoleSpy).toHaveBeenCalledWith(EVENT_MANAGER_NAME, TEST_MESSAGE);
  });

  it("should log an info message with the prefix", () => {
    const consoleSpy = jest.spyOn(console, "info").mockImplementation(() => {});
    logger.info(TEST_MESSAGE);

    expect(consoleSpy).toHaveBeenCalledWith(EVENT_MANAGER_NAME, TEST_MESSAGE);
  });

  it("should log a debug message with the prefix if debug is set to true", () => {
    config.set("debug", true);

    logger = new Logger(config);

    const consoleSpy = jest
      .spyOn(console, "debug")
      .mockImplementation(() => {});
    logger.debug(TEST_MESSAGE);

    expect(consoleSpy).toHaveBeenLastCalledWith(
      EVENT_MANAGER_NAME,
      "DEBUG:",
      TEST_MESSAGE,
      {
        targetOrigin: "https://example-target-origin.com",
        targetWindow: window,
      }
    );
  });

  it("should not log a debug message with the prefix if debug is set to false", () => {
    const consoleSpy = jest
      .spyOn(console, "debug")
      .mockImplementation(() => {});
    logger.debug(TEST_MESSAGE);

    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("should log an error message with the prefix", () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    logger.error(TEST_MESSAGE);

    expect(consoleSpy).toHaveBeenCalledWith(EVENT_MANAGER_NAME, TEST_MESSAGE);
  });
});

describe("getErrorMessage", () => {
  it("should return a string with the prefix", () => {
    expect(getErrorMessage("test message")).toBe(
      EVENT_MANAGER_NAME + ": test message"
    );
  });
});
