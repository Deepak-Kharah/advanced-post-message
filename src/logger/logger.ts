import { Config } from "../configHandler";
import { EVENT_MANAGER_NAME } from "../eventManager/eventManager.constant";

export class Logger {
  prefix = EVENT_MANAGER_NAME;
  options = {
    targetOrigin: Config.get("targetOrigin"),
    targetWindow: Config.get("targetWindow"),
  };

  constructor() {
    this.log = this.log.bind(this);
    this.info = this.info.bind(this);
    this.debug = this.debug.bind(this);
    this.error = this.error.bind(this);
  }

  public log(...args: any[]) {
    console.log(this.prefix, ...args);
  }

  public info(...args: any[]) {
    console.info(this.prefix, ...args);
  }

  public debug(...args: any[]) {
    if (Config.get("debug")) {
      console.debug(this.prefix, "DEBUG:", ...args, this.options);
    }
  }

  public error(...args: any[]) {
    console.error(this.prefix, ...args);
  }
}

export function getErrorMessage(message: string) {
  return EVENT_MANAGER_NAME + ": " + message;
}
