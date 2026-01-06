// Type definitions for @hcaptcha/react-hcaptcha 0.1
// Project: https://github.com/hCaptcha/react-hcaptcha
// Definitions by: Matt Sutkowski <https://github.com/msutkowski>
// Original Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.8

import * as React from "react";

interface HCaptchaState {
  isApiReady: boolean;
  isRemoved: boolean;
  elementId: string;
  captchaId: string;
}

interface HCaptchaProps {
  onExpire?: () => any;
  onOpen?: () => any;
  onClose?: () => any;
  onChalExpired?: () => any;
  onError?: (event: string) => any;
  onVerify?: (token: string, ekey: string) => any;
  onLoad?: () => any;
  onReady?: () => any;
  languageOverride?: string;
  sitekey: string;
  size?: "normal" | "compact" | "invisible";
  theme?: "light" | "dark" | "contrast" | Object;
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

interface ExecuteResponse {
  response: string;
  key: string;
}

declare class HCaptcha extends React.Component<HCaptchaProps, HCaptchaState> {
  resetCaptcha(): void;
  renderCaptcha(): void;
  removeCaptcha(): void;
  getRespKey(): string;
  getResponse(): string;
  setData(data: object): void;
  isReady(): boolean;
  execute(opts: { async: true, rqdata?: string }): Promise<ExecuteResponse>;
  execute(opts?: { async: false, rqdata?: string }): void;
  execute(opts?: { async?: boolean, rqdata?: string }): Promise<ExecuteResponse> | void;
}

export = HCaptcha;
