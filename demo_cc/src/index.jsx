import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import ModalCaptchaAction from './ModalCaptchaAction';

const sitekey = new URLSearchParams(window.location.search).get('sitekey')
  || 'a5f74b19-9e45-40e0-b45d-47ff91b7a6c2';

function App() {
  const [dismissOnBackdrop, setDismissOnBackdrop] = useState(false);

  return (
    <main>
      <h1>Custom challenge container</h1>
      <p>The puzzle renders inside a dimmed modal. Background interaction is blocked.</p>
      <label>
        <input
          type="checkbox"
          checked={dismissOnBackdrop}
          onChange={(event) => setDismissOnBackdrop(event.target.checked)}
        />
        Allow backdrop clicks and Escape to dismiss
      </label>
      <ModalCaptchaAction sitekey={sitekey} dismissOnBackdrop={dismissOnBackdrop} />
      <p>This frontend demo obtains a token. Verify it server-side before performing a protected action.</p>
    </main>
  );
}

createRoot(document.getElementById('app')).render(<App />);
