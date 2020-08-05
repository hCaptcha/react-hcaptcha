const React = require('react');

// Borrowed from https://github.com/ai/nanoid/blob/3.0.2/non-secure/index.js
// This alphabet uses `A-Za-z0-9_-` symbols. A genetic algorithm helped
// optimize the gzip compression for this alphabet.
const urlAlphabet =
  'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW'

const nanoid = (size = 21) => {
  let id = ''
  // A compact alternative for `for (var i = 0; i < step; i++)`.
  let i = size
  while (i--) {
    // `| 0` is more compact and faster than `Math.floor()`.
    id += urlAlphabet[(Math.random() * 64) | 0]
  }
  return id
}

 // Create script to init hCaptcha
let onLoadListeners = [];
let captchaScriptCreated = false;

// Generate hCaptcha API Script
const CaptchaScript = (hl, reCaptchaCompat) => {
  // Create global onload callback
  window.hcaptchaOnLoad = () => {
    // Iterate over onload listeners, call each listener
    onLoadListeners = onLoadListeners.filter(listener => {
      listener();
      return false;
    });
  };

  let script = document.createElement("script");
  script.src = "https://hcaptcha.com/1/api.js?render=explicit&onload=hcaptchaOnLoad";
  script.async = true
  if (hl) {
    script.src += `&hl=${hl}`
  }
  if (reCaptchaCompat === false) {
    script.src += '&recaptchacompat=off'
  }

  document.head.appendChild(script);
}


class HCaptcha extends React.Component {
    constructor (props) {
      super(props);
      const { id=null } = props;

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

      if (!isApiReady)
        captchaScriptCreated = false;

      this.state = {
        isApiReady,
        isRemoved: false,
        elementId: id || `hcaptcha-${nanoid()}`,
        captchaId: ''
      }
    }

    componentDidMount () { //Once captcha is mounted intialize hCaptcha - hCaptcha
      const { languageOverride, reCaptchaCompat } = this.props;
      const { isApiReady, elementId } = this.state;


      if (!isApiReady) {  //Check if hCaptcha has already been loaded, if not create script tag and wait to render captcha elementID - hCaptcha

        if (!captchaScriptCreated) {
            // Only create the script tag once, use a global variable to track
            captchaScriptCreated = true;
            CaptchaScript(languageOverride, reCaptchaCompat);
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

      this.setState({ isRemoved: true }, () => {
        hcaptcha.remove(captchaId);
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
