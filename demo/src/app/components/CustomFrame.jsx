import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function CustomFrame({ frame, children }) {
  const [frameDocument, setFrameDocument] = useState(frame);

  useEffect(() => {
    if (frame){
       setFrameDocument(frame.contentWindow.document);
    }
  }, [frame, setFrameDocument]);

  return frameDocument && createPortal(children, frameDocument.body);
}