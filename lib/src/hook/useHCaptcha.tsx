import { useContext } from "react";

import { HCaptchaContext } from "./Context.tsx";
export const useHCaptcha = () => useContext(HCaptchaContext);
