/**
 * Delays the execution of the function by the specified amount of time.
 * @param ms - The amount of time to delay the execution in milliseconds. Default is 1000ms.
 * @returns A promise that resolves after the specified amount of time has elapsed.
 */
export function sleep(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
