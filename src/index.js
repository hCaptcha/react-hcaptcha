const React = require('react');
const { generateQuery } = require("./utils.js");

 // Create script to init hCaptcha
let onLoadListeners = [];
let apiScriptRequested = false;

// Generate hCaptcha API Script
const mountCaptchaScript = (params={}) => {
  apiScriptRequested = true;
  // Create global onload callback
  window.hcaptchaOnLoad = () => {
    // Iterate over onload listeners, call each listener
    onLoadListeners = onLoadListeners.filter(listener => {
      listener();
      return false;
    });
  };

  const domain = params.apihost || "https://hcaptcha.com";
  delete params.apihost;

  const script = document.createElement("script");
  script.src = `${domain}/1/api.js?render=explicit&onload=hcaptchaOnLoad`;
  script.async = true;

  const query = generateQuery(params);
  script.src += query !== ""? `&${query}` : "";

  document.head.appendChild(script);
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

      const isApiReady = typeof hcaptcha !== 'undefined';

      this.ref = React.createRef();

      this.state = {
        isApiReady,
        isRemoved: false,
        elementId: props.id,
        captchaId: ''
      }
    }

    componentDidMount () { //Once captcha is mounted intialize hCaptcha - hCaptcha
      const { apihost, assethost, endpoint, host, imghost, languageOverride:hl, reCaptchaCompat, reportapi, sentry } = this.props;
      const { isApiReady } = this.state;

      if (!isApiReady) {  //Check if hCaptcha has already been loaded, if not create script tag and wait to render captcha

        if (!apiScriptRequested) {
            // Only create the script tag once, use a global variable to track
            mountCaptchaScript({
              apihost,
              assethost,
              endpoint,
              hl,
              host,
              imghost,
              recaptchacompat: reCaptchaCompat === false? "off" : null,
              reportapi,
              sentry
            });
        }

        // Add onload callback to global onload listeners
        onLoadListeners.push(this.handleOnLoad);
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
      // Prop Keys that could change
      const keys = ['sitekey', 'size', 'theme', 'tabindex', 'languageOverride', 'endpoint'];
      // See if any props changed during component update
      const match = keys.every( key => prevProps[key] === this.props[key]);

      // If they have changed, remove current captcha and render a new one
      if (!match) {
        this.removeCaptcha(() => {
          this.renderCaptcha();
        });
      }
    }

    renderCaptcha() {
      const { isApiReady } = this.state;
      if (!isApiReady) return;

      //Render hCaptcha widget and provide necessary callbacks - hCaptcha
      const captchaId = hcaptcha.render(this.ref.current,
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

    removeCaptcha(callback) {
      const { isApiReady, isRemoved, captchaId } = this.state;

      if (!isApiReady || isRemoved) return

      this.setState({ isRemoved: true }, () => {
        hcaptcha.remove(captchaId);
        callback && callback()
      });
    }

    handleOnLoad () {
      this.setState({ isApiReady: true }, () => {
        this.renderCaptcha();
      });
    }

    handleSubmit (event) {
      const { onVerify } = this.props;
      const { isRemoved, captchaId } = this.state;

      if (typeof hcaptcha === 'undefined' || isRemoved) return

      const token = hcaptcha.getResponse(captchaId) //Get response token from hCaptcha widget
      const ekey  = hcaptcha.getRespKey(captchaId)  //Get current challenge session id from hCaptcha widget
      onVerify(token, ekey) //Dispatch event to verify user response
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
      return <div ref={this.ref} id={elementId}></div>
    }
  }

module.exports = HCaptcha;
