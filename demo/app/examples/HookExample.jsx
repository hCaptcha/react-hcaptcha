import React, { useState } from 'react';
import { HCaptchaProvider, useHCaptcha } from "../../../src/hooks/index.js";

function Form() {
  const [email, setEmail] = useState("");
  const { ready, token, executeInstance } = useHCaptcha();

  const onSubmit = async () => {
    const response = await executeInstance();
    
    console.log("Token:", response);
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        placeholder="Email address"
        onChange={(evt) => setEmail(evt.target.value)}
      />

      <button onClick={onSubmit} disabled={!ready}>Submit</button>

      {token && <div>Success!</div>}
    </div>
  );
}

export function HookExample() {
  return (
    <HCaptchaProvider sitekey="10000000-ffff-ffff-ffff-000000000001">
      <Form />
    </HCaptchaProvider>
  );
}
