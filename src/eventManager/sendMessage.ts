import { Config } from "../configHandler";
import { Logger } from "../logger";
import { UserConfig } from "../types";
import {
  PostMessageSendOptions,
  EditorPostMessageNature,
  EditorRequestEventMessage,
} from "./postMessageEvents.types";

export class PostMessage {
  private config: UserConfig;

  constructor(
    private logger: Logger,
    config: Config
  ) {
    this.sendResponse = this.sendResponse.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this.sendAck = this.sendAck.bind(this);
    this.getMessage = this.getMessage.bind(this);

    this.config = config.getAll();
  }

  sendRequest(config: PostMessageSendOptions) {
    const completeConfig = {
      ...config,
      nature: EditorPostMessageNature.REQUEST,
    };
    this.logger.debug("Sending REQUEST", completeConfig);

    const message = this.getMessage(completeConfig);
    this.config.targetWindow.postMessage(message, this.config.targetOrigin);
  }

  sendResponse(config: PostMessageSendOptions) {
    const completeConfig = {
      ...config,
      nature: EditorPostMessageNature.RESPONSE,
    };
    this.logger.debug("Sending RESPONSE", completeConfig);

    const message = this.getMessage(completeConfig);
    this.config.targetWindow.postMessage(message, this.config.targetOrigin);
  }

  sendAck(config: Omit<PostMessageSendOptions, "payload" | "error">) {
    const completeConfig = {
      ...config,
      payload: undefined,
      error: undefined,
      nature: EditorPostMessageNature.ACK,
    };
    this.logger.debug("Sending ACK", completeConfig);

    const message = this.getMessage(completeConfig);
    this.config.targetWindow.postMessage(message, this.config.targetOrigin);
  }
  private getMessage(
    config: PostMessageSendOptions & {
      nature: EditorPostMessageNature;
    }
  ): EditorRequestEventMessage {
    const { nature, hash, payload, type, error } = config;
    return {
      eventManager: "advanced-post-message",
      metadata: {
        hash,
        nature,
      },
      channel: this.config.channelId,
      error,
      payload,
      type,
    };
  }
}
