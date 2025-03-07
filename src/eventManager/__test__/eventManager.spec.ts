import { ERROR_MESSAGES } from "../../logger/errorMessages.constants";
import { AdvancedPostMessage } from "../eventManager";

describe("AdvancedPostMessage on event", () => {
  const channelId = "eb987448-314b-47cf-a565-7fdf74b1af0c";
  let eventManager: AdvancedPostMessage;

  beforeEach(() => {
    eventManager = new AdvancedPostMessage(channelId);
  });

  afterEach(() => {
    eventManager.destroy();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
  it("should unregister the event listener when aborted", async () => {
    const callback = jest.fn();
    const eventId = "my-event";
    const abortController = new AbortController();
    const { signal } = abortController;

    eventManager.on(eventId, callback, {
      signal,
    });

    await eventManager.send(eventId, { foo: "bar" });

    expect(callback).toHaveBeenCalled();

    abortController.abort();

    expect(() => eventManager.send(eventId, { foo: "bar" })).rejects.toThrow(
      ERROR_MESSAGES.receiveEvent.noRequestListenerFound(eventId)
    );
  });
});

describe("AdvancedPostMessage send event", () => {
  const channelId = "e3a9e977-79e9-447f-b72f-4f23229f727e";
  let eventManager: AdvancedPostMessage;

  beforeEach(() => {
    eventManager = new AdvancedPostMessage(channelId);
  });

  jest.useFakeTimers();
  it("should cancel the send event if aborted", async () => {
    const callback = jest.fn().mockImplementation(() => {
      jest.runOnlyPendingTimers();
    });
    const eventId = "cancelled-event";

    eventManager.on(eventId, callback);

    expect(() =>
      eventManager.send(
        eventId,
        { foo: "bar" },
        {
          signal: AbortSignal.abort(),
        }
      )
    ).rejects.toThrow(ERROR_MESSAGES.sendEvent.eventCancelled);
  });
});
