const React = require('react');

// Create random ID
const randomID = () => `${(Number(String(Math.random()).slice(2)) + Date.now() + Math.round(performance.now())).toString(36)}`;

 // Create script to init hCaptcha
const CaptchaScript = (cb, hl) => {
    let script = document.createElement("script")

    window.hcaptchaOnLoad = cb;
    script.src = "https://hcaptcha.com/1/api.js?render=explicit&onload=hcaptchaOnLoad";
    script.async = true

    if (hl) {
      script.src += `&hl=${hl}`
    }

    return script;
}


class HCaptcha extends React.Component {
    constructor (props) {
      super(props);

      // API Methods
      this.renderCaptcha = this.renderCaptcha.bind(this);
      this.resetCaptcha  = this.resetCaptcha.bind(this);
      this.removeCaptcha = this.removeCaptcha.bind(this);

      // Event Handlers
      this.handleOnLoad = this.handleOnLoad.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleExpire = this.handleExpire.bind(this);
      this.handleError  = this.handleError.bind(this);

      this.state = {
        isApiReady: typeof hcaptcha !== 'undefined',
        isRemoved: false,
        elementId: `hcaptcha-${randomID()}`,
        captchaId: ''
      }
    }

    componentDidMount () { //Once captcha is mounted intialize hCaptcha - hCaptcha
      const { languageOverride } = this.props;
      const { isApiReady, elementId } = this.state;


      if (!isApiReady) {  //Check if hCaptcha has already been loaded, if not create script tag and wait to render captcha elementID - hCaptcha
        let script = CaptchaScript(this.handleOnLoad, languageOverride);
        document.getElementById(elementId).appendChild(script);
      } else {
        this.renderCaptcha();
      }
    }

    componentWillUnmount() {
        const { isApiReady, isRemoved, captchaId } = this.state;
        if(!isApiReady || isRemoved) return

        // Reset any stored variables / timers when unmounting
        hcaptcha.reset(captchaId);
        hcaptcha.remove(captchaId);
    }

    shouldComponentUpdate(nextProps, nextState) {
      // Prevent component re-rendering when these internal state variables are updated
      if (this.state.isApiReady !== nextState.isApiReady || this.state.isRemoved !== nextState.isRemoved) {
        return false;
      }

      return true;
    }

    componentDidUpdate(prevProps) {
      const { endpoint } = this.props;

      // Prop Keys that could change
      const keys = ['sitekey', 'size', 'theme', 'tabindex', 'languageOverride', 'endpoint'];
      // See if any props changed during component update
      const match = keys.every( key => prevProps[key] === this.props[key]);

      // If they have changed, remove current captcha and render a new one
      if (!match) {
        this.removeCaptcha();
        this.renderCaptcha();
      }
    }

    renderCaptcha() {
      const { isApiReady, elementId } = this.state;
      if (!isApiReady) return;

      //Render hCaptcha widget and provide neccessary callbacks - hCaptcha
      const captchaId = hcaptcha.render(document.getElementById(elementId),
        {
          ...this.props,
          "error-callback"  : this.handleError,
          "expired-callback": this.handleExpire,
          "callback"        : this.handleSubmit
        });

      this.setState({ isRemoved: false, captchaId });
    }

    resetCaptcha() {
      const { isApiReady, isRemoved, captchaId } = this.state;

      if (!isApiReady || isRemoved) return
      // Reset captcha state, removes stored token and unticks checkbox
      hcaptcha.reset(captchaId)
    }

    removeCaptcha() {
      const { isApiReady, isRemoved, captchaId } = this.state;

      if (!isApiReady || isRemoved) return

      this.setState({ isRemoved: true });
      hcaptcha.remove(captchaId);
    }

    handleOnLoad () {
      this.setState({ isApiReady: true });
      this.renderCaptcha();
    }

    handleSubmit (event) {
      const { onVerify } = this.props;
      const { isRemoved, captchaId } = this.state;

      if (typeof hcaptcha === 'undefined' || isRemoved) return

      const token = hcaptcha.getResponse(captchaId) //Get response token from hCaptcha widget - hCaptcha
      onVerify(token) //Dispatch event to verify user response
    }

    handleExpire () {
      const { onExpire } = this.props;
      const { isApiReady, isRemoved, captchaId } = this.state;

      if (!isApiReady || isRemoved) return
      hcaptcha.reset(captchaId) // If hCaptcha runs into error, reset captcha - hCaptcha

      if (onExpire) onExpire();
    }

    handleError (event) {
      const { onError } = this.props;
      const { isApiReady, isRemoved, captchaId } = this.state;

      if (!isApiReady || isRemoved) return

      hcaptcha.reset(captchaId) // If hCaptcha runs into error, reset captcha - hCaptcha
      if (onError) onError(event);
    }

    execute () {
      const { isApiReady, isRemoved, captchaId } = this.state;

      if (!isApiReady || isRemoved) return

      hcaptcha.execute(captchaId)
    }

    render () {
      const { elementId } = this.state;
      return <div id={elementId}></div>
    }
  }

module.exports = HCaptcha;
