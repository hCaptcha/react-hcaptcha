const { useRef } = require('react');
const React = require('react');
const {render} = require('react-dom');
const HCaptcha = require('../../dist/');

const AsyncDemo = () => {
  const captchaRef = useRef();

  const executeCaptcha = async () => {
    try {
      const res = await captchaRef.current.execute();
      console.log("Verified asynchronously: ", res);

    } catch (error) {
      console.log(error);
    }
  };

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
      />
      <button onClick={executeCaptcha}>Execute asynchronously</button>
      <button onClick={getRespKey}>Get Response Key</button>
      <button onClick={getResponse}>Get Response</button>
    </div>
  );
}

class ReactDemo extends React.Component {

  constructor(props) {
    super(props);

    this.state = {isVerified: false, async: false};
    this.captcha = React.createRef();

    this.handleChange = this.handleChange.bind(this);
    this.handleReset  = this.handleReset.bind(this);
    this.onVerifyCaptcha = this.onVerifyCaptcha.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleChallengeExpired = this.handleChallengeExpired.bind(this);
    // Leave languageOverride unset or null for browser autodetection.
    // To force a language, use the code: https://hcaptcha.com/docs/languages
    this.languageOverride = null; // "fr";
  }

  handleChange(event) {
    this.setState({isVerified: true});
  }

  onVerifyCaptcha(token) {
    console.log("Verified: " + token);
    this.setState({isVerified: true})
  }

  handleSubmit(event) {
    event.preventDefault()
    this.child.execute()
  }

  handleReset(event) {
    event.preventDefault()
    this.captcha.current.resetCaptcha()
    this.setState({isVerified: false})
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

  render() {
    const { isVerified } = this.state;

    return (
      <div>
        <p>
          Set your sitekey and onVerify callback as props, and drop into your form. From here, we'll take care of the rest.
        </p>
        <div style={{marginBottom: 10}}>
          <label>
            <input type="radio" name="behavior" checked={!this.state.async} onChange={() => this.setState({ async: false })}></input>
            Normal
          </label>
          <label>
            <input type="radio" name="behavior" checked={this.state.async} onChange={() => this.setState({ async: true })}></input>
            Asynchronous
          </label>
        </div>
        {!this.state.async ? (
          <>
            <div>
            <HCaptcha
              ref={this.captcha}
              onVerify={this.onVerifyCaptcha}
              languageOverride={this.languageOverride}
              sitekey="10000000-ffff-ffff-ffff-000000000001"
              theme="light"
              onOpen={this.handleOpen}
              onClose={this.handleClose}
              onError={this.handleError}
              onChalExpired={this.handleChallengeExpired}
            />
            </div>

            <div>
              <HCaptcha
                ref={this.captcha}
                onVerify={this.onVerifyCaptcha}
                languageOverride={this.languageOverride}
                sitekey="10000000-ffff-ffff-ffff-000000000001"
                theme="dark"
                onOpen={this.handleOpen}
                onClose={this.handleClose}
                onError={this.handleError}
                onChalExpired={this.handleChallengeExpired}
              />
            </div>

            <div>
              <HCaptcha
                ref={this.captcha}
                onVerify={this.onVerifyCaptcha}
                languageOverride={this.languageOverride}
                sitekey="10000000-ffff-ffff-ffff-000000000001"
                size="compact"
                theme="dark"
                onOpen={this.handleOpen}
                onClose={this.handleClose}
                onError={this.handleError}
                onChalExpired={this.handleChallengeExpired}
              />
            </div>
            {isVerified &&
              <div>
                <p>Open your console to see the Verified response.</p>
                <button onClick={this.handleReset}>Reset Captcha</button>
              </div>
            }
          </>
        ) : (
          <AsyncDemo />
        )}
      </div>
    );
  }
}

render(
  <div>
    <h1>HCaptcha React Demo</h1>
    <ReactDemo />
  </div>,
  document.getElementById('app')
);
