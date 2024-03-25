import { ZalgoPromise } from "zalgo-promise";

export interface OnEvent<Payload = any> {
  data: Payload;
}

export interface EventManagerOptions {
  target: Window;
  debug: boolean;
  /**
   * @default false
   */
  suppressErrors: boolean;
  targetOrigin: string;
}

export interface ResponseListener {
  promise: ZalgoPromise<unknown>;
  type: string;
  hasCancelled: boolean;
  hasReceivedAck: boolean;
}

export interface RequestListener {
  handler: RequestHandler;
}

export type RequestHandler<Payload = any, ReturnType = any> = (
  event: OnEvent<Payload>
) => ReturnType;
