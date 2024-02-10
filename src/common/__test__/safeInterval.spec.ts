import { safeInterval } from "@common/safeInterval";

describe("safeInterval", () => {
  jest.useFakeTimers();

  it("should call the method every specified time interval", () => {
    const mockMethod = jest.fn();
    const interval = safeInterval(mockMethod, 1000);

    jest.advanceTimersByTime(1000);
    expect(mockMethod).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1000);
    expect(mockMethod).toHaveBeenCalledTimes(2);

    interval.cancel();
  });

  it("should cancel the interval when cancel is called", () => {
    const mockMethod = jest.fn();
    const interval = safeInterval(mockMethod, 1000);

    jest.advanceTimersByTime(1000);
    expect(mockMethod).toHaveBeenCalledTimes(1);

    interval.cancel();

    jest.advanceTimersByTime(1000);
    expect(mockMethod).toHaveBeenCalledTimes(1);
  });
});
