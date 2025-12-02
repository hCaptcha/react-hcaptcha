import React, { useEffect, useRef, useState } from "react";
import HCaptcha from "../index.js";
import { HCaptchaContext } from "./Context";

export const HCaptchaProvider = ({
  sitekey = null,
  invisible = false,
  theme = "light",
  rqdata = null,
  languageOverride = null,
  onVerify,
  onError,
  children,
}) => {
  const hcaptchaRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  const handleReady = () => {
    console.log("hCaptcha loaded and ready");
    setReady(true);
  };

  const handleError = (error) => {
    console.error("hCaptcha error: ", error);
  };

  const handleExpire = () => {
    console.warn("hCaptcha token expired");
    setToken(null);
  };

  const handleVerify = (token) => {
    setToken(token);
    onVerify && onVerify(token);
  };

  const executeInstance = async (config = {}) => {
    try {
      if (!ready) {
        throw new Error("hCaptcha not ready");
      }

      if (token) {
        resetInstance();
      }

      const { response } = await hcaptchaRef.current.execute({
        async: true,
        ...(config.rqdata ? { rqdata: config.rqdata } : {}),
      });

      setToken(response);
      
      return response;
    } catch (error) {
      setError(error);
      onError && onError(error);
    }
  };

  const resetInstance = () => {
    hcaptchaRef?.current?.resetCaptcha();
  };

  useEffect(() => {
    if (rqdata) {
      /* Note: rqdata must be unique per session */
      hcaptchaRef?.current?.setData(rqdata);
    }
  }, [rqdata]);

  return (
    <HCaptchaContext.Provider
      value={{
        sitekey,
        error,
        token,
        ready,
        executeInstance,
        resetInstance,
      }}
    >
      {children}
      <HCaptcha
        sitekey={sitekey}
        size={invisible ? "invisible" : "normal"}
        theme={theme}
        languageOverride={languageOverride}
        onReady={handleReady}
        onVerify={handleVerify}
        onExpire={handleExpire}
        onError={handleError}
        ref={hcaptchaRef}
      ></HCaptcha>
    </HCaptchaContext.Provider>
  );
};
