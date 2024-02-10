import { ERROR_MESSAGES } from "@logger/errorMessages.constants";

describe("ERROR_MESSAGES", () => {
  it("should have the correct common error messages", () => {
    expect(ERROR_MESSAGES.common.windowClosed).toEqual(
      "The window closed before the response was received"
    );
  });

  it("should have the correct sendEvent error messages", () => {
    expect(ERROR_MESSAGES.sendEvent.receiverReturnedError).toEqual(
      "The receiver returned an error"
    );
    expect(ERROR_MESSAGES.sendEvent.eventCancelled).toEqual(
      "The event was cancelled"
    );
    expect(ERROR_MESSAGES.sendEvent.noAckReceived).toEqual(
      "The ACK was not received"
    );
  });

  it("should have the correct receiveEvent error messages", () => {
    expect(ERROR_MESSAGES.receiveEvent.noRequestListenerFound("test")).toEqual(
      'No request listener found for event "test"'
    );
    expect(ERROR_MESSAGES.receiveEvent.codeReturnedError).toEqual(
      "The code returned an error"
    );
    expect(ERROR_MESSAGES.receiveEvent.noResponseListenerFound("test")).toEqual(
      'No response listener found for hash "test"'
    );
    expect(ERROR_MESSAGES.receiveEvent.noAckListenerFound("test")).toEqual(
      'No ack listener found for hash "test"'
    );
    expect(ERROR_MESSAGES.receiveEvent.unknownNature("test")).toEqual(
      'The nature "test" is unknown'
    );
  });

  it("should have the correct registerEvent error messages", () => {
    expect(ERROR_MESSAGES.registerEvent.eventAlreadyRegistered("test")).toEqual(
      'The event "test" is already registered'
    );
  });

  it("should have the correct unregisterEvent error messages", () => {
    expect(ERROR_MESSAGES.unregisterEvent.eventDoesNotExist("test")).toEqual(
      'The event "test" does not exist'
    );
  });
});
