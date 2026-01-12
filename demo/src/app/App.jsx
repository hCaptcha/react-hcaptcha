
import React, { useEffect, useState } from 'react';

import { AsyncExample, ClassExample, FrameExample, HookExample } from './examples/index.js';
import { CustomFrame } from './components/index.js';

export function App() {
  const [frame, setFrame] = useState(null);
  const [frameDocument, setFrameDocument] = useState(frame);

  useEffect(() => {
    const onLoad = () => {
      const frame = document.getElementById('example-frame');
      setFrame(frame);
      setFrameDocument(frame.contentWindow.document);
    };

    if (document.readyState === 'complete') {
      onLoad();
    } else {
      window.addEventListener('load', onLoad, false);
      return () => window.removeEventListener('load', onLoad);
    }
  }, [setFrame]);

  return (
    <div>
      <div style={{marginBottom: 16}}>
        <h1>HCaptcha React Demo</h1>
        <p>
          Set your sitekey and onVerify callback as props, and drop into your form. From here, we'll take care of the rest.
        </p>
      </div>
      <div style={{marginBottom: 48}}>
        <h3>Async Example</h3>
        <AsyncExample />
      </div>
      <div style={{marginBottom: 48}}>
        <h3>Class Example</h3>
        <ClassExample />
      </div>
      <div style={{marginBottom: 48}}>
        <h3>Hook Example (Provider/Context Pattern)</h3>
        <HookExample />
      </div>
      <div>
        <h3>Frame Example</h3>
        <CustomFrame frame={frame}>
          <FrameExample document={frameDocument} />
        </CustomFrame>
      </div>
    </div>
  )
}