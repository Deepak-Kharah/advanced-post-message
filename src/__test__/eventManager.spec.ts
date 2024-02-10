import { Config } from "@configHandler/configHandler";
import { ERROR_MESSAGES } from "@logger/errorMessages.constants";
import { AdvancedPostMessage } from "@/index";
import { Logger, getErrorMessage } from "@logger/logger";
import { sleep } from "@testUtils/sleep";

const CHANNEL_ID = "channel-id";

jest.mock("@common/uniqueId", () => {
  return {
    uniqueId: jest.fn().mockReturnValue("4b1c383a"),
  };
});

describe("event manager constructor", () => {
  let eventManager: AdvancedPostMessage;
  beforeAll(() => {
    jest.spyOn(window, "postMessage").mockImplementation(() => {});

    jest.spyOn(console, "debug").mockImplementation(() => {});
    jest.spyOn(Logger.prototype, "error").mockImplementation((...messages) => {
      if (
        messages.at(-1) ===
        getErrorMessage(ERROR_MESSAGES.sendEvent.noAckReceived)
      ) {
        return;
      }
      Logger.prototype.error(...messages);
    });
  });
  afterEach(() => {
    jest.clearAllMocks();

    if (eventManager) {
      eventManager.destroy();
    }
  });

  afterAll(() => {
    jest.restoreAllMocks();
    Config.reset();
  });

  test("should throw an error if the channel ID is not provided", () => {
    expect(() => {
      eventManager = new AdvancedPostMessage("");
    }).toThrowError(getErrorMessage(ERROR_MESSAGES.common.channelIdRequired));
  });

  test("should set the target window provided by the user", async () => {
    const targetWindow = {
      addEventListener: jest.fn(),
      postMessage: jest.fn(),
    } as unknown as Window;

    eventManager = new AdvancedPostMessage(CHANNEL_ID, {
      target: targetWindow,
    });

    try {
      await eventManager.send("test");
    } catch (e) {
      expect(e).toBe(getErrorMessage(ERROR_MESSAGES.sendEvent.noAckReceived));
    }

    expect(targetWindow.postMessage).toHaveBeenCalledTimes(1);
    expect(window.postMessage).toHaveBeenCalledTimes(0);
  });

  test("should set the target origin provided by the user", async () => {
    const TEST_ORIGIN = "https://example.com";
    eventManager = new AdvancedPostMessage(CHANNEL_ID, {
      targetOrigin: TEST_ORIGIN,
    });

    try {
      await eventManager.send("test");
    } catch (e) {
      expect(e).toBe(getErrorMessage(ERROR_MESSAGES.sendEvent.noAckReceived));
    }

    const receivedTargetOrigin = (window.postMessage as jest.Mock).mock
      .calls[0][1];

    expect(receivedTargetOrigin).toBe(TEST_ORIGIN);
  });

  test("should set the current window if no target window is provided", async () => {
    eventManager = new AdvancedPostMessage(CHANNEL_ID);

    try {
      await eventManager.send("test");
    } catch (e) {
      expect(e).toBe(getErrorMessage(ERROR_MESSAGES.sendEvent.noAckReceived));
    }

    expect(window.postMessage).toHaveBeenCalledTimes(1);
  });

  test("should set the any origin if no target origin is provided", async () => {
    Config.reset();
    eventManager = new AdvancedPostMessage(CHANNEL_ID);

    try {
      await eventManager.send("test");
    } catch (e) {
      expect(e).toBe(getErrorMessage(ERROR_MESSAGES.sendEvent.noAckReceived));
    }

    const receivedTargetOrigin = (window.postMessage as jest.Mock).mock
      .calls[0][1];

    expect(receivedTargetOrigin).toBe("*");
  });

  test("should set a mocked window if the window is undefined", async () => {
    const { window } = global;

    // Mock window does not exist
    //@ts-expect-error: Mock window should not exist
    delete global.window;
    //@ts-expect-error: Mock window should not exist
    global.window = null;

    eventManager = new AdvancedPostMessage(CHANNEL_ID, {
      debug: true,
    });

    try {
      await eventManager.send("test-window-undefined");
    } catch (e) {
      expect(e).toBe(getErrorMessage(ERROR_MESSAGES.sendEvent.noAckReceived));
    }

    expect(window.postMessage).toHaveBeenCalledTimes(0);
    expect(console.debug).toHaveBeenCalledTimes(3);

    const receivedDebugMessage = (console.debug as jest.Mock).mock.calls[0][2];

    expect(receivedDebugMessage).toBe(
      "advanced-post-message: The window was not found."
    );

    // Restore window
    global.window = window;
  });
});

describe("send method", () => {
  let eventManager: AdvancedPostMessage;
  const mockHandler = jest.fn().mockImplementation((input) => {
    return { hello: "world", input };
  });

  beforeAll(() => {
    jest.spyOn(window, "postMessage");
    jest.spyOn(console, "debug").mockImplementation(() => {});
    jest.spyOn(Logger.prototype, "error").mockImplementation((...messages) => {
      if (
        messages.at(-1) ===
        getErrorMessage(ERROR_MESSAGES.sendEvent.noAckReceived)
      ) {
        return;
      }
      Logger.prototype.error(...messages);
    });
  });

  beforeEach(() => {
    eventManager = new AdvancedPostMessage(CHANNEL_ID);
    eventManager.on("test", mockHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();

    if (eventManager) {
      eventManager.destroy();
    }
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test("should send a message to the target window", async () => {
    await eventManager.send("test");

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  test("should expect a response from the target window", async () => {
    const receivedValue = await eventManager.send<string>("test");

    /**
     * The three times are:
     * 1. The request
     * 2. The ack
     * 3. The response
     */
    expect(window.postMessage).toHaveBeenCalledTimes(3);
    expect(receivedValue).toMatchObject({
      hello: "world",
      input: { data: undefined },
    });
  });

  test.skip("should raise an error if the target window is closed", async () => {
    const iframe = document.createElement("iframe");
    iframe.src = "https://example.com";
    document.body.appendChild(iframe);

    const iframeWindow = iframe.contentWindow!;
    iframeWindow.close();

    const eventManager = new AdvancedPostMessage(CHANNEL_ID, {
      target: iframeWindow,
      debug: true,
    });

    try {
      await eventManager.send("test-window-closed");
      window.postMessage(
        {
          eventManager: "advanced-post-message",
          metadata: {
            hash: "test-response-not-received-4b1c383a",
            nature: "REQUEST",
          },
          channel: "channel-id",
          payload: undefined,
          type: "test-response-not-received",
        },
        "*"
      );
    } catch (e) {
      expect(e).toBe(getErrorMessage(ERROR_MESSAGES.common.windowClosed));
    }

    eventManager.destroy();
  });

  test("should raise an error if the ack is not received in time", async () => {
    const iframe = document.createElement("iframe");
    iframe.src = "https://example.com";
    document.body.appendChild(iframe);

    const iframeWindow = iframe.contentWindow!;

    eventManager.destroy();

    eventManager = new AdvancedPostMessage(CHANNEL_ID, {
      target: iframeWindow,
    });

    try {
      await eventManager.send("test-ack-not-received");
    } catch (e) {
      expect(e).toBe(getErrorMessage(ERROR_MESSAGES.sendEvent.noAckReceived));
    }

    eventManager.destroy();
  });

  test("should raise an error if the response is not received", async () => {
    const iframe = document.createElement("iframe");
    iframe.src = "https://example.com";
    document.body.appendChild(iframe);

    const iframeWindow = iframe.contentWindow!;

    eventManager.destroy();

    eventManager = new AdvancedPostMessage(CHANNEL_ID, {
      target: iframeWindow,
    });

    try {
      await eventManager.send("test-ack-not-received");
    } catch (e) {
      expect(e).toBe(
        //! Currently we do not throw an error if the response is not received
        getErrorMessage(ERROR_MESSAGES.sendEvent.noAckReceived)
      );
    }

    eventManager.destroy();
  });

  test("should send the payload to the target window", async () => {
    await eventManager.send("test", "payload");

    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledWith({ data: "payload" });
  });
});

describe("on method", () => {
  let eventManager: AdvancedPostMessage;
  const mockHandler = jest.fn().mockImplementation((input) => {
    return { hello: "world", input };
  });

  beforeAll(() => {
    jest.spyOn(console, "debug").mockImplementation(() => {});
  });

  test("should save the handler if the event is not registered", async () => {
    eventManager = new AdvancedPostMessage(CHANNEL_ID);

    eventManager.on("test", mockHandler);

    const response = await eventManager.send("test", "payload");

    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledWith({ data: "payload" });
    expect(response).toMatchObject({});

    eventManager.destroy();
  });
  test("should log an error if the event is already registered", () => {
    const spiedLogger = jest
      .spyOn(Logger.prototype, "error")
      .mockImplementation((...messages) => {
        if (
          messages.at(-1) ===
          getErrorMessage(
            ERROR_MESSAGES.registerEvent.eventAlreadyRegistered("test")
          )
        ) {
          return;
        }
        Logger.prototype.error(...messages);
      });

    eventManager = new AdvancedPostMessage(CHANNEL_ID);

    eventManager.on("test", () => {});
    eventManager.on("test", () => {});

    expect(Logger.prototype.error).toHaveBeenCalledTimes(1);

    expect(Logger.prototype.error).toHaveBeenCalledWith(
      getErrorMessage(
        ERROR_MESSAGES.registerEvent.eventAlreadyRegistered("test")
      )
    );

    spiedLogger.mockRestore();

    eventManager.destroy();
  });
  test("should return an unsubscribe function", () => {
    eventManager = new AdvancedPostMessage(CHANNEL_ID, { debug: true });

    const event = eventManager.on("test", () => {});

    expect(typeof event.unregister).toBe("function");

    eventManager.destroy();
  });
});

describe("unregister method", () => {
  let eventManager: AdvancedPostMessage;
  const mockHandler = jest.fn().mockImplementation((input) => {
    return { hello: "world", input };
  });

  beforeAll(() => {
    jest.spyOn(console, "debug");
  });
  test("should remove the handler if the event is registered", async () => {
    eventManager = new AdvancedPostMessage(CHANNEL_ID, { debug: true });

    const event = eventManager.on("test", mockHandler);

    event.unregister();

    expect(console.debug).toHaveBeenCalledTimes(1);
    expect(console.debug).toHaveBeenCalledWith(
      "advanced-post-message",
      "DEBUG:",
      "Unregistering event",
      "test",
      { targetOrigin: "*", targetWindow: window }
    );

    eventManager.destroy();
  });
  test("should log an error if the event is not registered", () => {
    const spiedLogger = jest
      .spyOn(Logger.prototype, "error")
      .mockImplementation((...messages) => {
        if (
          messages.at(-1) ===
          getErrorMessage(
            ERROR_MESSAGES.unregisterEvent.eventDoesNotExist("test")
          )
        ) {
          return;
        }
        Logger.prototype.error(...messages);
      });

    eventManager = new AdvancedPostMessage(CHANNEL_ID);

    const event = eventManager.on("test", () => {});
    event.unregister();
    event.unregister();

    expect(Logger.prototype.error).toHaveBeenCalledTimes(1);

    expect(Logger.prototype.error).toHaveBeenCalledWith(
      getErrorMessage(ERROR_MESSAGES.unregisterEvent.eventDoesNotExist("test"))
    );

    spiedLogger.mockRestore();

    eventManager.destroy();
  });
});

describe("message handlers", () => {
  let eventManager: AdvancedPostMessage;
  const mockHandler = jest.fn().mockImplementation((input) => {
    return { hello: "world", input };
  });

  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation((...messages) => {
      if (
        messages
          .at(-1)
          ?.startsWith?.(
            "advanced-post-message: No ack listener found for hash"
          ) ||
        messages
          .at(-1)
          ?.startsWith?.(
            "advanced-post-message: No response listener found for hash"
          ) ||
        messages.at(1) ===
          'advanced-post-message: The nature "UNKNOWN" is unknown'
      ) {
        return;
      }

      console.error(...messages);
    });
  });

  beforeEach(() => {
    eventManager = new AdvancedPostMessage(CHANNEL_ID);
    eventManager.on("test", mockHandler);
  });

  afterEach(() => {
    if (eventManager) {
      eventManager.destroy();
    }

    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test("should not do anything if the message is not for EVENT_MANAGER", async () => {
    const correctEvent = {
      eventManager: "advanced-post-message",
      metadata: {
        hash: "test-4b1c383a",
        nature: "REQUEST",
      },
      channel: "channel-id",
      payload: undefined,
      type: "test",
    } as const;

    const incorrectEvent: Omit<typeof correctEvent, "eventManager"> = {
      metadata: {
        hash: "test-4b1c383a",
        nature: "REQUEST",
      },
      channel: "channel-id",
      payload: undefined,
      type: "test",
    } as const;
    window.postMessage(correctEvent, "*");
    window.postMessage(incorrectEvent, "*");

    await sleep();

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  test("should not do anything if the message is not for current channel", async () => {
    const correctEvent = {
      eventManager: "advanced-post-message",
      metadata: {
        hash: "test-4b1c383a",
        nature: "REQUEST",
      },
      channel: "channel-id",
      payload: undefined,
      type: "test",
    } as const;

    const incorrectEvent = {
      eventManager: "advanced-post-message",
      metadata: {
        hash: "test-4b1c383a",
        nature: "REQUEST",
      },
      channel: "incorrect-channel-id",
      payload: undefined,
      type: "test",
    } as const;

    window.postMessage(correctEvent, "*");
    window.postMessage(incorrectEvent, "*");

    await sleep();

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  test("should log an error if the nature is unknown", async () => {
    const event = {
      eventManager: "advanced-post-message",
      metadata: {
        hash: "test-4b1c383a",
        nature: "UNKNOWN",
      },
      channel: "channel-id",
      payload: undefined,
      type: "test",
    } as const;

    window.postMessage(event, "*");
    await sleep();

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      "advanced-post-message",
      'advanced-post-message: The nature "UNKNOWN" is unknown',
      {
        channel: "channel-id",
        eventManager: "advanced-post-message",
        metadata: { hash: "test-4b1c383a", nature: "UNKNOWN" },
        payload: undefined,
        type: "test",
      }
    );
  });
});

describe("on Request nature, the sdk", () => {
  let eventManager: AdvancedPostMessage;
  const mockHandler = jest.fn().mockImplementation((input) => {
    return { hello: "world", input };
  });

  beforeAll(() => {
    jest.spyOn(Logger.prototype, "debug").mockImplementation(() => {});

    jest.spyOn(Logger.prototype, "error").mockImplementation(() => {});
  });

  beforeEach(() => {
    eventManager = new AdvancedPostMessage(CHANNEL_ID, { debug: true });
    eventManager.on("test", mockHandler);
  });

  afterEach(() => {
    if (eventManager) {
      eventManager.destroy();
    }

    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test("should log a debug message if debug is true", async () => {
    await eventManager.send("test");

    // it is testing the entire cycle
    expect(Logger.prototype.debug).toHaveBeenCalledTimes(6);

    const receivedDebugMessage = (
      Logger.prototype.debug as jest.Mock
    ).mock.calls.at(1);

    expect(receivedDebugMessage.at(0)).toBe("REQUEST received");

    if (receivedDebugMessage.at(1)?.metadata?.hash) {
      delete receivedDebugMessage.at(1)?.metadata?.hash;
    } else {
      throw new Error("hash not found");
    }

    expect(receivedDebugMessage.at(1)).toMatchObject({
      channel: "channel-id",
      eventManager: "advanced-post-message",
      metadata: {
        nature: "REQUEST",
      },
      payload: undefined,
      type: "test",
    });
  });
  test("should send an acknowledgement sender", async () => {
    await eventManager.send("test");

    const receivedDebugMessage = (
      Logger.prototype.debug as jest.Mock
    ).mock.calls.at(2);

    expect(receivedDebugMessage.at(0)).toBe("Sending ACK");

    if (receivedDebugMessage.at(1)?.hash) {
      delete receivedDebugMessage.at(1)?.hash;
    } else {
      throw new Error("hash not found");
    }

    expect(receivedDebugMessage.at(1)).toMatchObject({
      type: "test",
      payload: undefined,
      nature: "ACK",
    });
  });

  test("should log an error if the handler is not found for the type", async () => {
    try {
      await eventManager.send("test-not-found");
    } catch (err) {
      expect(err).toMatchObject({
        code: "NO_REQUEST_LISTENER_FOUND",
        message:
          'advanced-post-message: No request listener found for event "test-not-found"',
      });
    }

    expect(Logger.prototype.debug).toHaveBeenNthCalledWith(
      4,
      'advanced-post-message: No request listener found for event "test-not-found"'
    );
  });

  test("should log an error if the handler throws an error", async () => {
    const mockErrorHandler = jest.fn().mockImplementation(() => {
      throw new Error("test");
    });

    eventManager.on("test-error", mockErrorHandler);

    const event = {
      eventManager: "advanced-post-message",
      metadata: {
        hash: "test-error-4b1c383a",
        nature: "REQUEST",
      },
      channel: "channel-id",
      payload: undefined,
      type: "test-error",
    } as const;

    window.postMessage(event, "*");

    await sleep(100);

    const receivedErrorMessage = (Logger.prototype.error as jest.Mock).mock
      .calls;

    expect(Logger.prototype.error).toHaveBeenCalledTimes(2);

    expect(receivedErrorMessage.at(0).at(0)).toBe(
      "advanced-post-message: The code returned an error"
    );
  });
});
