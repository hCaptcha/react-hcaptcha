import React from 'react';

import HCaptcha from '../../../src/index.js';


export class ClassExample extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isVerified: false,
      async: false,
      theme: 'light',
    };
    this.captcha = React.createRef();

    this.handleChange = this.handleChange.bind(this);
    this.handleReset  = this.handleReset.bind(this);
    this.onVerifyCaptcha = this.onVerifyCaptcha.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleChallengeExpired = this.handleChallengeExpired.bind(this);
    this.handleThemeChange = this.handleThemeChange.bind(this);
    // Leave languageOverride unset or null for browser autodetection.
    // To force a language, use the code: https://hcaptcha.com/docs/languages
    this.languageOverride = null; // "fr";
  }

  handleChange(event) {
    this.setState({ isVerified: true });
  }

  onVerifyCaptcha(token) {
    console.log("Verified: " + token);
    this.setState({ isVerified: true })
  }

  handleSubmit(event) {
    event.preventDefault()
    this.child.execute()
  }

  handleReset(event) {
    event.preventDefault()
    this.captcha.current.resetCaptcha()
    this.setState({ isVerified: false })
  }

  handleOpen() {
    console.log("HCaptcha [onOpen]: The user display of a challenge starts.");
  }

  handleClose() {
    console.log("HCaptcha [onClose]: The user dismisses a challenge.");
  }

  handleError(error) {
    console.log("HCaptcha [onError]:", error);
  };

  handleChallengeExpired() {
    console.log("HCaptcha [onChalExpired]: The user display of a challenge times out with no answer.");
  }

  handleThemeChange() {
    this.setState(state => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    }));
  }

  render() {
    const { isVerified, theme } = this.state;

    return (
      <div>
        <HCaptcha
          ref={this.captcha}
          onVerify={this.onVerifyCaptcha}
          languageOverride={this.languageOverride}
          sitekey="10000000-ffff-ffff-ffff-000000000001"
          theme={theme}
          onOpen={this.handleOpen}
          onClose={this.handleClose}
          onError={this.handleError}
          onChalExpired={this.handleChallengeExpired}
          sentry={false}
          userJourneys={true}
        />
        <div style={{ display: 'flex', paddingTop: '8px', gap: '8px' }}>
          <button onClick={this.handleThemeChange}>Change theme</button>
          {isVerified && (
            <button onClick={this.handleReset}>Reset Captcha</button>
          )}
        </div>
        {isVerified && (
          <p>Open your console to see the Verified response.</p>
        )}
      </div>
    );
  }
}
