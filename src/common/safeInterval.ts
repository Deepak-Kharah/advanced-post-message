export function safeInterval(
  method: () => void,
  time: number
): { cancel: () => void } {
  let timeout: NodeJS.Timeout;

  function loop() {
    timeout = setTimeout(() => {
      method();
      loop();
    }, time);
  }
  loop();

  return {
    cancel() {
      clearTimeout(timeout);
    },
  };
}
