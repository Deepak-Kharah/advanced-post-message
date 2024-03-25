export interface UserConfig {
  targetWindow: Window;
  targetOrigin: string;
  debug: boolean;
  channelId: string;
  /**
   * @default false
   */
  suppressErrors: boolean;
}
