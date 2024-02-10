import { ZalgoPromise } from "zalgo-promise";

import { safeInterval } from "@common/safeInterval";
import { uniqueId } from "@common/uniqueId";
import { Config } from "@configHandler/configHandler";
import {
    EVENT_MANAGER_NAME,
    RESPONSE_CYCLE,
} from "@eventManager/eventManager.constant";
import {
    EventManagerOptions,
    OnEvent,
    RequestHandler,
    RequestListener,
    ResponseListener,
} from "@eventManager/eventManager.types";
import {
    EditorPostMessageNature,
    EditorRequestEventMessage,
} from "@eventManager/postMessageEvents.types";
import { PostMessage } from "@eventManager/sendMessage";
import { ERROR_CODES, ERROR_MESSAGES } from "@logger/errorMessages.constants";
import { Logger, getErrorMessage } from "@logger/logger";

/**
 * Manages the events and message communication between different windows or iframes.
 */
export class EventManager {
    private requestMessageHandlers = new Map<string, RequestListener>();
    private responseMessageHandlers = new Map<string, ResponseListener>();
    private postMessage: PostMessage;
    private logger: Logger;

    constructor(channelId: string, options: Partial<EventManagerOptions> = {}) {
        if (!channelId) {
            throw new Error(
                getErrorMessage(ERROR_MESSAGES.common.channelIdRequired)
            );
        }
        Config.replace({ ...options, channelId: channelId });

        this.logger = new Logger();
        this.postMessage = new PostMessage(this.logger);

        this.handleIncomingMessage = this.handleIncomingMessage.bind(this);
        this.send = this.send.bind(this);
        this.on = this.on.bind(this);
        this.unregisterEvent = this.unregisterEvent.bind(this);

        if (!window) {
            this.logger.debug(
                getErrorMessage(ERROR_MESSAGES.common.windowNotFound)
            );
        } else {
            window.addEventListener("message", this.handleIncomingMessage);
        }
    }

    /**
     * Handle an incoming post message event
     * @param event The post message event containing details of the request
     * @returns A promise that resolves when the response is received
     */
    private async handleIncomingMessage(
        event: MessageEvent<EditorRequestEventMessage>
    ) {
        const { type, channel, payload, eventManager, metadata, error } =
            event.data;

        if (
            eventManager !== EVENT_MANAGER_NAME ||
            channel !== Config.get("channelId")
        ) {
            return;
        }

        const { hash, nature } = metadata;

        switch (nature) {
            case EditorPostMessageNature.REQUEST: {
                this.logger.debug("REQUEST received", event.data);
                if (Config.get("targetWindow").closed) {
                    this.logger.error(
                        getErrorMessage(ERROR_MESSAGES.common.windowClosed)
                    );
                }

                this.postMessage.sendAck({ type, hash });

                if (!this.requestMessageHandlers.has(type)) {
                    this.logger.debug(
                        getErrorMessage(
                            ERROR_MESSAGES.receiveEvent.noRequestListenerFound(
                                type
                            )
                        )
                    );

                    this.postMessage.sendResponse({
                        type,
                        hash,
                        payload: undefined,
                        error: {
                            code: ERROR_CODES.receiveEvent
                                .noRequestListenerFound,
                            message: getErrorMessage(
                                ERROR_MESSAGES.receiveEvent.noRequestListenerFound(
                                    type
                                )
                            ),
                        },
                    });
                    return;
                }

                const { handler } = this.requestMessageHandlers.get(type)!;

                const handlerEvent: OnEvent = {
                    data: payload,
                };

                return ZalgoPromise.all([
                    ZalgoPromise.try(() => {
                        return handler(handlerEvent);
                    })
                        .then((data) => {
                            this.postMessage.sendResponse({
                                type,
                                hash,
                                payload: data,
                                error: undefined,
                            });
                        })
                        .catch((err) => {
                            this.logger.error(
                                getErrorMessage(
                                    ERROR_MESSAGES.receiveEvent
                                        .codeReturnedError
                                ),
                                err
                            );
                        }),
                ]);
            }
            case EditorPostMessageNature.RESPONSE: {
                this.logger.debug("RESPONSE received", event.data);

                if (!this.responseMessageHandlers.has(hash)) {
                    this.logger.error(
                        getErrorMessage(
                            ERROR_MESSAGES.receiveEvent.noResponseListenerFound(
                                hash
                            )
                        )
                    );
                    return;
                }

                const responseListener =
                    this.responseMessageHandlers.get(hash)!;

                if (error) {
                    responseListener.promise.reject(error);
                } else {
                    responseListener.promise.resolve(payload);
                }

                break;
            }
            case EditorPostMessageNature.ACK: {
                this.logger.debug("ACK received", event.data);

                if (!this.responseMessageHandlers.has(hash)) {
                    this.logger.error(
                        getErrorMessage(
                            ERROR_MESSAGES.receiveEvent.noAckListenerFound(hash)
                        )
                    );
                    return;
                }

                const responseListener =
                    this.responseMessageHandlers.get(hash)!;
                responseListener.hasReceivedAck = true;

                break;
            }
            default:
                this.logger.error(
                    getErrorMessage(
                        ERROR_MESSAGES.receiveEvent.unknownNature(nature)
                    ),
                    event.data
                );
        }
    }

    /**
     * Send an event to the target window
     * @param type The type of event to send
     * @param payload The payload to send with the event
     *
     * @example
     * const eventManager = new EventManager("channel-id");
     *
     * const output = eventManager.send("my-event", { foo: "bar" });
     * console.log(output) // { foo: "bar1" }
     */
    async send<ReturnType = undefined>(type: string, payload?: any) {
        const promise = new ZalgoPromise<ReturnType>();
        const hash = uniqueId(type);

        const responseListener: ResponseListener = {
            type,
            promise,
            hasCancelled: false,
            hasReceivedAck: false,
        };

        this.responseMessageHandlers.set(hash, responseListener);

        const totalAllowedAckTime = 1000;
        let ackTimeLeft = totalAllowedAckTime;

        const interval = safeInterval(() => {
            if (Config.get("targetWindow").closed) {
                return promise.reject(
                    new Error(
                        getErrorMessage(ERROR_MESSAGES.common.windowClosed)
                    )
                );
            }

            // TODO: raise this event
            // if (responseListener.hasCancelled) {
            //     return promise.reject(
            //         new Error(
            //             getErrorMessage(ERROR_MESSAGES.sendEvent.eventCancelled)
            //         )
            //     );
            // }

            ackTimeLeft = Math.max(ackTimeLeft - RESPONSE_CYCLE, 0);

            if (!responseListener.hasReceivedAck && ackTimeLeft <= 0) {
                return promise.reject(
                    getErrorMessage(ERROR_MESSAGES.sendEvent.noAckReceived)
                );
            }
        }, RESPONSE_CYCLE);

        promise
            .finally(() => {
                this.responseMessageHandlers.delete(hash);
                interval.cancel();
            })
            .catch((err) => {
                this.logger.debug(
                    getErrorMessage(
                        ERROR_MESSAGES.sendEvent.receiverReturnedError
                    ),
                    err
                );
            });

        this.postMessage.sendRequest({
            type,
            hash,
            error: undefined,
            payload,
        });

        return promise;
    }

    /**
     * Register an event handler for a specific event type
     * @param type The type of event to listen for
     * @param handler The handler to call when the event is received
     * @returns An object with an unregister method to unregister the event
     *
     * @example
     * const eventManager = new EventManager("channel-id");
     *
     * const unregister = eventManager.on("my-event", (event) => {
     *  console.log("event received", event.data);
     *  return { foo: "bar1" };
     * });
     *
     * unregister();
     */
    on<Payload = unknown, ReturnType = any>(
        type: string,
        handler: RequestHandler<Payload, ReturnType>
    ) {
        if (this.requestMessageHandlers.has(type)) {
            this.logger.error(
                getErrorMessage(
                    ERROR_MESSAGES.registerEvent.eventAlreadyRegistered(type)
                )
            );
        }

        const requestListener: RequestListener = {
            handler,
        };
        this.requestMessageHandlers.set(type, requestListener);

        return {
            unregister: () => {
                this.unregisterEvent(type);
            },
        };
    }

    /**
     * Unregister an event handler for a specific event type
     * @param type The type of event to unregister
     */
    private unregisterEvent(type: string) {
        if (!this.requestMessageHandlers.has(type)) {
            this.logger.error(
                getErrorMessage(
                    ERROR_MESSAGES.unregisterEvent.eventDoesNotExist(type)
                )
            );
        } else {
            this.logger.debug("Unregistering event", type);

            this.requestMessageHandlers.delete(type);
        }
    }

    /**
     * Updates the configuration options for the event manager.
     * @param config - The partial configuration options to update.
     */
    updateConfig(
        config: Partial<EventManagerOptions> & { channelId?: string }
    ) {
        Config.replace(config);
    }

    /**
     * Destroy the event manager
     */
    destroy() {
        window.removeEventListener("message", this.handleIncomingMessage);
    }
}
