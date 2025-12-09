// Type definitions for @hcaptcha/react-hcaptcha/hooks
// Project: https://github.com/hCaptcha/react-hcaptcha

import * as React from "react";

export interface HCaptchaContextValue {
  sitekey: string | null;
  token: string | null;
  error: string | Error | null;
  ready: boolean;
  executeInstance: (config?: { rqdata?: string }) => Promise<string | undefined>;
  resetInstance: () => void;
}

export interface HCaptchaProviderProps {
  sitekey: string;
  size?: "normal" | "compact" | "invisible";
  theme?: "light" | "dark" | "contrast" | object;
  rqdata?: string | null;
  languageOverride?: string | null;
  onVerify?: (token: string) => void;
  onError?: (error: string | Error) => void;
  children: React.ReactNode;
}

export const HCaptchaContext: React.Context<HCaptchaContextValue>;

export const HCaptchaProvider: React.FC<HCaptchaProviderProps>;

export function useHCaptcha(): HCaptchaContextValue;
