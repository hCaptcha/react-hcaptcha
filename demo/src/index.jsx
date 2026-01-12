import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './app/App.jsx';

const root = createRoot(document.getElementById('app'))
root.render(<App />);