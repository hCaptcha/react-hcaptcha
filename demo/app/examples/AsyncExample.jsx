import React, { useRef, useEffect } from 'react';

import HCaptcha from '../../../src/index.js';

export function AsyncExample() {
  const captchaRef = useRef();

  const executeCaptcha = async () => {
    try {
      const res = await captchaRef.current.execute({
        async: true
      });
      console.log("Verified asynchronously: ", res);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    executeCaptcha();
  }, []);

  const getResponse = () => {
    try {
      const res = captchaRef.current.getResponse();
      console.log("Response: ", res);

    } catch (error) {
      console.log(error);
    }
  };

  const getRespKey = () => {
    try {
      const res = captchaRef.current.getRespKey();
      console.log("Response Key: ", res);

    } catch (error) {
      console.log(error);
    }
  };

  const handleOpen = () => {
    console.log("HCaptcha [onOpen]: The user display of a challenge starts.");
  };

  const handleClose = () => {
    console.log("HCaptcha [onClose]: The user dismisses a challenge.");
  };

  const handleError = error => {
    console.log("HCaptcha [onError]:", error);
  };

  const handleChallengeExpired = () => {
    console.log("HCaptcha [onChalExpired]: The user display of a challenge times out with no answer.");
  };

  return (
    <div>
      <HCaptcha
        ref={captchaRef}
        sitekey="10000000-ffff-ffff-ffff-000000000001"
        theme="light"
        onVerify={() => undefined}
        onOpen={handleOpen}
        onClose={handleClose}
        onError={handleError}
        onChalExpired={handleChallengeExpired}
        sentry={false}
      />
      <div style={{ display: 'flex', paddingTop: '8px', gap: '8px' }}>
        <button onClick={executeCaptcha}>Execute asynchronously</button>
        <button onClick={getRespKey}>Get Response Key</button>
        <button onClick={getResponse}>Get Response</button>
      </div>
    </div>
  );
}
