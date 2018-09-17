import React from 'react';
import ReactDOM from 'react-dom';
import HCaptcha from './component/HCaptcha';

ReactDOM.render(
  <div>
    <h1>HCaptcha React Demo</h1>
    <div>
      <HCaptcha></HCaptcha>
    </div>
  </div>,
  document.getElementById('app')
);

module.hot.accept();