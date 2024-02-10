import { Config } from "@configHandler/configHandler";
import { EVENT_MANAGER_NAME } from "@eventManager/eventManager.constant";
import { Logger, getErrorMessage } from "@logger/logger";

describe("Logger", () => {
  let logger: Logger;
  const TEST_MESSAGE = "test message";

  beforeAll(() => {
    Config.reset();
  });

  beforeEach(() => {
    Config.set("targetOrigin", "https://example-target-origin.com");
    Config.set("targetWindow", window);
    Config.set("debug", false);

    logger = new Logger();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    Config.reset();
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
    Config.set("debug", true);

    logger = new Logger();

    const consoleSpy = jest
      .spyOn(console, "debug")
      .mockImplementation(() => {});
    logger.debug(TEST_MESSAGE);

    expect(consoleSpy).toHaveBeenCalledWith(
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
