import React, { useRef } from 'react';

import HCaptcha from '../../../src/index.js';

export function FrameExample({ document }) {
  const captchaRef = useRef();

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

  const handleVerified = (token) => {
    console.log("Verified: " + token);
  };

  return (
    <HCaptcha
      ref={captchaRef}
      sitekey="10000000-ffff-ffff-ffff-000000000001"
      theme="light"
      onVerify={handleVerified}
      onOpen={handleOpen}
      onClose={handleClose}
      onError={handleError}
      onChalExpired={handleChallengeExpired}
      scriptLocation={document.head}
      challenge-container={document.body}
    />
);
}