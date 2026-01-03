import { useContext } from "react";

import { HCaptchaContext } from "./Context";
export const useHCaptcha = () => useContext(HCaptchaContext);
