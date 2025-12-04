import { useContext } from "react";

import { HCaptchaContext } from "./Context.jsx";
export const useHCaptcha = () => useContext(HCaptchaContext);
