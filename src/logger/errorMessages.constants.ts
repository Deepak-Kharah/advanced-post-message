export const ERROR_MESSAGES = {
  common: {
    windowClosed: "The window closed before the response was received",
    windowNotFound: "The window was not found.",
    channelIdRequired: "The channelId is required",
  },
  sendEvent: {
    receiverReturnedError: "The receiver returned an error",
    eventCancelled: "The event was cancelled",
    noAckReceived: "The ACK was not received",
  },
  receiveEvent: {
    noRequestListenerFound(type: string) {
      return `No request listener found for event "${type}"` as const;
    },
    codeReturnedError: "The code returned an error",
    noResponseListenerFound(hash: string) {
      return `No response listener found for hash "${hash}"` as const;
    },
    noAckListenerFound(hash: string) {
      return `No ack listener found for hash "${hash}"` as const;
    },
    unknownNature(nature: string) {
      return `The nature "${nature}" is unknown` as const;
    },
  },
  registerEvent: {
    eventAlreadyRegistered(type: string) {
      return `The event "${type}" is already registered` as const;
    },
  },
  unregisterEvent: {
    eventDoesNotExist(type: string) {
      return `The event "${type}" does not exist` as const;
    },
  },
} as const;

export const ERROR_CODES = {
  common: {
    windowClosed: "WINDOW_CLOSED",
    windowNotFound: "WINDOW_NOT_FOUND",
  },
  sendEvent: {
    receiverReturnedError: "RECEIVER_RETURNED_ERROR",
    eventCancelled: "EVENT_CANCELLED",
    noAckReceived: "NO_ACK_RECEIVED",
  },
  receiveEvent: {
    noRequestListenerFound: "NO_REQUEST_LISTENER_FOUND",
    codeReturnedError: "CODE_RETURNED_ERROR",
    noResponseListenerFound: "NO_RESPONSE_LISTENER_FOUND",
    noAckListenerFound: "NO_ACK_LISTENER_FOUND",
    unknownNature: "UNKNOWN_NATURE",
  },
  registerEvent: {
    eventAlreadyRegistered: "EVENT_ALREADY_REGISTERED",
  },
  unregisterEvent: {
    eventDoesNotExist: "EVENT_DOES_NOT_EXIST",
  },
} as const;
