// Type definitions for @hcaptcha/react-hcaptcha 2.0
// Project: https://github.com/hCaptcha/react-hcaptcha
// Definitions by: Matt Sutkowski <https://github.com/msutkowski>
// Original Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

import * as React from "react";

export interface HCaptchaState {
  isApiReady: boolean;
  isRemoved: boolean;
  elementId: string;
  captchaId: string;
}

export interface HCaptchaProps {
  onExpire?: () => void;
  onOpen?: () => void;
  onClose?: () => void;
  onChalExpired?: () => void;
  onError?: (event: string) => void;
  onVerify?: (token: string, ekey: string) => void;
  onLoad?: () => void;
  onReady?: () => void;
  languageOverride?: string;
  sitekey: string;
  size?: "normal" | "compact" | "invisible";
  theme?: "light" | "dark" | "contrast" | object;
  tabIndex?: number;
  id?: string;
  reCaptchaCompat?: boolean;
  loadAsync?: boolean;
  scriptLocation?: HTMLElement | null;
  sentry?: boolean;
  userJourneys?: boolean;
  cleanup?: boolean;
  custom?: boolean;
  secureApi?: boolean;
  scriptSource?: string;
  apihost?: string;
  assethost?: string;
  endpoint?: string;
  host?: string;
  imghost?: string;
  reportapi?: string;
}

export interface ExecuteResponse {
  response: string;
  key: string;
}

export declare class HCaptcha extends React.Component<HCaptchaProps, HCaptchaState> {
  resetCaptcha(): void;
  renderCaptcha(): void;
  removeCaptcha(): void;
  getRespKey(): string;
  getResponse(): string;
  setData(data: object): void;
  isReady(): boolean;
  execute(opts: { async: true; rqdata?: string }): Promise<ExecuteResponse>;
  execute(opts?: { async: false; rqdata?: string }): void;
  execute(opts?: { async?: boolean; rqdata?: string }): Promise<ExecuteResponse> | void;
}

export default HCaptcha;
