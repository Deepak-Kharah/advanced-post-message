import { Config } from "../../configHandler";
import { Logger } from "../../logger";
import {
  EditorPostMessageNature,
  AdvPostMessageErrorObject,
} from "../postMessageEvents.types";
import { PostMessage } from "../sendMessage";

describe("PostMessage", () => {
  const targetWindow = window;
  const targetOrigin = "http://localhost:3000";
  const channelId = "test-channel";
  Config.reset();
  let logger: Logger;
  let loggerSpy: jest.SpyInstance;

  let postMessage: PostMessage;

  beforeEach(() => {
    Config.set("targetOrigin", targetOrigin);
    Config.set("targetWindow", targetWindow);
    Config.set("channelId", channelId);
    logger = new Logger();
    loggerSpy = jest.spyOn(logger, "debug");
    postMessage = new PostMessage(logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
    loggerSpy.mockRestore();
  });

  afterAll(() => {
    Config.reset();
    jest.restoreAllMocks();
  });

  describe("sendRequest", () => {
    it("should send a request message", () => {
      const payload = { foo: "bar" };
      const type = "test-type";
      const hash = "test-hash";

      const postMessageSpy = jest.spyOn(targetWindow, "postMessage");

      postMessage.sendRequest({ payload, type, hash, error: undefined });

      expect(postMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          eventManager: "advanced-post-message",
          metadata: {
            hash,
            nature: EditorPostMessageNature.REQUEST,
          },
          channel: channelId,
          error: undefined,
          payload,
          type,
        }),
        targetOrigin
      );
    });

    it("should call debug logger", () => {
      const payload = { foo: "bar" };
      const type = "test-type";
      const hash = "test-hash";

      postMessage.sendRequest({ payload, type, hash, error: undefined });

      expect(loggerSpy).toHaveBeenCalledWith(
        "Sending REQUEST",
        expect.objectContaining({
          hash,
          nature: EditorPostMessageNature.REQUEST,
          error: undefined,
          payload,
          type,
        })
      );
    });
  });

  describe("sendResponse", () => {
    it("should send a response message", () => {
      const payload = { foo: "bar" };
      const type = "test-type";
      const hash = "test-hash";

      const postMessageSpy = jest.spyOn(targetWindow, "postMessage");

      postMessage.sendResponse({ payload, type, hash, error: undefined });

      expect(postMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          eventManager: "advanced-post-message",
          metadata: {
            hash,
            nature: EditorPostMessageNature.RESPONSE,
          },
          channel: channelId,
          error: undefined,
          payload,
          type,
        }),
        targetOrigin
      );
    });

    it("should call debug logger", () => {
      const payload = { foo: "bar" };
      const type = "test-type";
      const hash = "test-hash";

      postMessage.sendResponse({ payload, type, hash, error: undefined });

      expect(loggerSpy).toHaveBeenCalledWith(
        "Sending RESPONSE",
        expect.objectContaining({
          hash,
          nature: EditorPostMessageNature.RESPONSE,
          error: undefined,
          payload,
          type,
        })
      );
    });

    it("should send proper error object", () => {
      const payload = undefined;
      const error: AdvPostMessageErrorObject = {
        code: "test-code",
        message: "test-message",
      };
      const type = "test-type";
      const hash = "test-hash";

      const postMessageSpy = jest.spyOn(targetWindow, "postMessage");

      postMessage.sendResponse({
        payload,
        type,
        hash,
        error: error,
      });

      expect(postMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          eventManager: "advanced-post-message",
          metadata: {
            hash,
            nature: EditorPostMessageNature.RESPONSE,
          },
          channel: channelId,
          error,
          payload,
          type,
        }),
        targetOrigin
      );
    });
  });

  describe("sendAck", () => {
    it("should send an ack message", () => {
      const type = "test-type";
      const hash = "test-hash";

      const postMessageSpy = jest.spyOn(targetWindow, "postMessage");

      postMessage.sendAck({ type, hash });

      expect(postMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: "test-channel",
          eventManager: "advanced-post-message",
          metadata: { hash, nature: EditorPostMessageNature.ACK },
          error: undefined,
          payload: undefined,
          type,
        }),
        targetOrigin
      );
    });

    it("should call debug logger", () => {
      const type = "test-type";
      const hash = "test-hash";

      postMessage.sendAck({ type, hash });

      expect(loggerSpy).toHaveBeenCalledWith(
        "Sending ACK",
        expect.objectContaining({
          hash,
          nature: EditorPostMessageNature.ACK,
          error: undefined,
          payload: undefined,
          type,
        })
      );
    });
  });
});
