import { getErrorMessage } from "../../logger";
import { ERROR_MESSAGES } from "../../logger/errorMessages.constants";
import { Config } from "../configHandler";

describe("Config handler", () => {
  it("should get initialized with default config", () => {
    const config = new Config().getAll();

    expect(config.targetWindow).not.toBeUndefined();
    //@ts-expect-error
    delete config.targetWindow;

    expect(config).toEqual({
      debug: false,
      channelId: "",
      suppressErrors: false,
      targetOrigin: "*",
    });
  });

  it("should replace the current config with the provided partial config", () => {
    const config = new Config();

    expect(config.get("debug")).toBe(false);

    config.replace({ debug: true });

    expect(config.get("debug")).toBe(true);
  });

  it("should set a specific config key to the provided value", () => {
    const config = new Config();

    expect(config.get("debug")).toBe(false);

    config.set("debug", true);

    expect(config.get("debug")).toBe(true);
  });

  it("should not allow to set empty channel ID", () => {
    const config = new Config();

    expect(config.get("channelId")).toBe("");

    config.replace({ channelId: "test-channel-id" });

    expect(config.get("channelId")).toBe("test-channel-id");

    expect(() => config.replace({ channelId: "" })).toThrowError(
      getErrorMessage(ERROR_MESSAGES.common.channelIdRequired)
    );
  });

  it("should reset the config to the default values", () => {
    const config = new Config();

    config.replace({ debug: true, channelId: "test-channel-id" });

    expect(config.get("debug")).toBe(true);
    expect(config.get("channelId")).toBe("test-channel-id");

    config.reset();

    expect(config.get("debug")).toBe(false);
    expect(config.get("channelId")).toBe("");
  });

  it("should handle the suppress errors flag", () => {
    const config = new Config();

    expect(config.get("suppressErrors")).toBe(false);

    config.replace({ suppressErrors: true });

    expect(config.get("suppressErrors")).toBe(true);
  });
});
