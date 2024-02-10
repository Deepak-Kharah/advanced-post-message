import { Config } from "@configHandler/configHandler";
import { ERROR_MESSAGES } from "@logger/errorMessages.constants";
import { getErrorMessage } from "@logger/logger";

describe("Config handler", () => {
  beforeAll(() => {
    Config.reset();

    // to activate the coverage
    new Config();
  });

  afterEach(() => {
    Config.reset();
  });

  it("should get initialized with default config", () => {
    const config = Config.getAll();

    expect(config.targetWindow).not.toBeUndefined();
    //@ts-expect-error
    delete config.targetWindow;

    expect(config).toEqual({
      debug: false,
      channelId: "",
      targetOrigin: "*",
    });
  });

  it("should replace the current config with the provided partial config", () => {
    expect(Config.get("debug")).toBe(false);

    Config.replace({ debug: true });

    expect(Config.get("debug")).toBe(true);
  });

  it("should set a specific config key to the provided value", () => {
    expect(Config.get("debug")).toBe(false);

    Config.set("debug", true);

    expect(Config.get("debug")).toBe(true);
  });

  it("should not allow to set empty channel ID", () => {
    expect(Config.get("channelId")).toBe("");

    Config.replace({ channelId: "test-channel-id" });

    expect(Config.get("channelId")).toBe("test-channel-id");

    expect(() => Config.replace({ channelId: "" })).toThrowError(
      getErrorMessage(ERROR_MESSAGES.common.channelIdRequired)
    );
  });
});
