const React = require("react");
const { render } = require("react-dom");
const HCaptcha = require("../../src/");

const ReactDemo = () => {
  const [isVerified, setIsVerified] = React.useState(false);
  const captcha = React.useRef(null);

  const languageOverride = "null";

  const onVerifyCaptcha = (token) => {
    console.log("Verified: " + token);
    setIsVerified(true);
  };

  const handleReset = (event) => {
    event.preventDefault();
    captcha.current.resetCaptcha();
    setIsVerified(false);
  };

  return (
    <div>
      <p>
        Set your sitekey and onVerify callback as props, and drop into your
        form. From here, we'll take care of the rest.
      </p>
      <div>
        <HCaptcha
          ref={captcha}
          onVerify={onVerifyCaptcha}
          languageOverride={languageOverride}
          sitekey="589d9e8b-0576-49c3-8841-d1800375d9bb"
          theme="dark"
        />
      </div>

      {isVerified && (
        <div>
          <p>Open your console to see the Verified response.</p>
          <button onClick={handleReset}>Reset Captcha</button>
        </div>
      )}
    </div>
  );
};

render(
  <div>
    <h1>HCaptcha React Demo</h1>
    <ReactDemo />
  </div>,
  document.getElementById("app")
);
