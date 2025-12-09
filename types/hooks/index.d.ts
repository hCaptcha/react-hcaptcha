import * as React from "react";

export interface HCaptchaContextValue {
  sitekey: string | null;
  error: string | null;
  token: string | null;
  ready: boolean;
  executeInstance: (config?: { rqdata?: string }) => Promise<string | undefined>;
  resetInstance: () => void;
}

export interface HCaptchaProviderProps {
  sitekey?: string | null;
  size?: "normal" | "compact" | "invisible";
  theme?: "light" | "dark" | "contrast" | object;
  rqdata?: string | null;
  languageOverride?: string | null;
  onVerify?: (token: string) => void;
  onError?: (error: string) => void;
  children?: React.ReactNode;
}

export function useHCaptcha(): HCaptchaContextValue;

export function HCaptchaProvider(props: HCaptchaProviderProps): React.JSX.Element;
