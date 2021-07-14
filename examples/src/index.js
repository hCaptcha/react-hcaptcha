const { useRef } = require('react');
const React = require('react');
const {render} = require('react-dom');
const HCaptcha = require('../../dist/');

const Test = () => {
  const captchaRef = useRef();

  const executeCaptcha = async () => {
    const k = await captchaRef.current.executeAsync();
    console.log(k);
  }

  return (
    <div>
      <HCaptcha ref={captchaRef}
        sitekey="917ba1eb-0b37-486e-9c90-39f3cb7b2579"
        theme="light"
        onVerify={() => console.log('verified')}
        />
        <button onClick={executeCaptcha}>fafa</button>
    </div>
  );
}

class ReactDemo extends React.Component {

  constructor(props) {
    super(props);

    this.state = {isVerified: false};
    this.captcha = React.createRef();

    this.handleChange = this.handleChange.bind(this);
    this.handleReset  = this.handleReset.bind(this);
    this.onVerifyCaptcha = this.onVerifyCaptcha.bind(this);
    // Leave languageOverride unset or null for browser autodetection.
    // To force a language, use the code: https://hcaptcha.com/docs/languages
    this.languageOverride = null; // "fr";
  }

  handleChange(event) {
    this.setState({isVerified: true});
  }

  onVerifyCaptcha (token) {
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

  render() {
    const { isVerified } = this.state;

    return (
      <div>
        <p>
          Set your sitekey and onVerify callback as props, and drop into your form. From here, we'll take care of the rest.
        </p>
        <div>
          <HCaptcha ref={this.captcha} onVerify={this.onVerifyCaptcha} languageOverride={this.languageOverride}
          sitekey="917ba1eb-0b37-486e-9c90-39f3cb7b2579"
          theme="light"
          />
        </div>

        <div>
          <HCaptcha onVerify={this.onVerifyCaptcha} languageOverride={this.languageOverride}
          sitekey="917ba1eb-0b37-486e-9c90-39f3cb7b2579"
          theme="dark"
          />
        </div>

        <div>
          <HCaptcha onVerify={this.onVerifyCaptcha} languageOverride={this.languageOverride}
          sitekey="917ba1eb-0b37-486e-9c90-39f3cb7b2579"
          size="compact"
          theme="dark"
          />
        </div>

        {isVerified &&
          <div>
            <p>Open your console to see the Verified response.</p>
            <button onClick={this.handleReset}>Reset Captcha</button>
          </div>
        }
        <button onClick={this.executeCaptcha}>fafa</button>
        <Test />
      </div>
    );
  }
}

render(
  <div>
    <h1>HCaptcha React Demo</h1>
    <Test />
  </div>,
  document.getElementById('app')
);
