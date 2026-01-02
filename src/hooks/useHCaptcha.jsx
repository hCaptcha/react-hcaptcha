import { useContext } from "react";

import { HCaptchaContext } from "./Context.js";
export const useHCaptcha = () => useContext(HCaptchaContext);
