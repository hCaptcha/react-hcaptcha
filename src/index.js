import * as React from 'react';
import { generateQuery } from "./utils.js";

const SCRIPT_ID = 'hcaptcha-api-script-id';
const HCAPTCHA_LOAD_FN_NAME = 'hcaptchaOnLoad';

// Prevent loading API script multiple times
let resolveFn;
let rejectFn;
const mountPromise = new Promise((resolve, reject) => {
  resolveFn = resolve;
  rejectFn = reject;
});

// Generate hCaptcha API script
const mountCaptchaScript = (params={}) => {
  if (document.getElementById(SCRIPT_ID)) {
    // API was already requested
    return mountPromise;
  }

  // Create global onload callback
  window[HCAPTCHA_LOAD_FN_NAME] = resolveFn;

  const domain = params.apihost || "https://js.hcaptcha.com";
  delete params.apihost;

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = `${domain}/1/api.js?render=explicit&onload=${HCAPTCHA_LOAD_FN_NAME}`;
  script.async = true;
  script.onerror = (event) => rejectFn('script-error');

  const query = generateQuery(params);
  script.src += query !== ""? `&${query}` : "";

  document.head.appendChild(script);
  return mountPromise;
};


class HCaptcha extends React.Component {
    constructor (props) {
      super(props);

      // API Methods
      this.renderCaptcha = this.renderCaptcha.bind(this);
      this.resetCaptcha  = this.resetCaptcha.bind(this);
      this.removeCaptcha = this.removeCaptcha.bind(this);
      this.isReady = this.isReady.bind(this);

      // Event Handlers
      this.loadCaptcha = this.loadCaptcha.bind(this);
      this.handleOnLoad = this.handleOnLoad.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleExpire = this.handleExpire.bind(this);
      this.handleError  = this.handleError.bind(this);
      this.handleOpen = this.handleOpen.bind(this);
      this.handleClose = this.handleClose.bind(this);
      this.handleChallengeExpired = this.handleChallengeExpired.bind(this);

      const isApiReady = typeof hcaptcha !== 'undefined';

      this.ref = React.createRef();
      this.apiScriptRequested = false;

      this.state = {
        isApiReady,
        isRemoved: false,
        elementId: props.id,
        captchaId: ''
      }
    }

    componentDidMount () { // Once captcha is mounted intialize hCaptcha - hCaptcha
      const { isApiReady } = this.state;

      /*
       * Check if hCaptcha has already been loaded,
       * If Yes, render the captcha
       * If No, create script tag and wait to render the captcha
       */
      if (isApiReady) {
        this.renderCaptcha();

        return;
      }

      this.loadCaptcha();
    }

    componentWillUnmount() {
      const { captchaId } = this.state;

      if (!this.isReady()) {
        return;
      }

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

    loadCaptcha() {
      if (this.apiScriptRequested) {
        return;
      }

      const {
        apihost,
        assethost,
        endpoint,
        host,
        imghost,
        languageOverride: hl,
        reCaptchaCompat,
        reportapi,
        sentry,
        custom
      } = this.props;
      const mountParams = {
        apihost,
        assethost,
        endpoint,
        hl,
        host,
        imghost,
        recaptchacompat: reCaptchaCompat === false? "off" : null,
        reportapi,
        sentry,
        custom
      };

      mountCaptchaScript(mountParams)
        .then(this.handleOnLoad)
        .catch(this.handleError);
      this.apiScriptRequested = true;
    }

    renderCaptcha(onReady) {
      const { isApiReady } = this.state;
      if (!isApiReady) return;

      const renderParams = Object.assign({
        "open-callback"       : this.handleOpen,
        "close-callback"      : this.handleClose,
        "error-callback"      : this.handleError,
        "chalexpired-callback": this.handleChallengeExpired,
        "expired-callback"    : this.handleExpire,
        "callback"            : this.handleSubmit,
      }, this.props, {
        hl: this.props.hl || this.props.languageOverride,
        languageOverride: undefined
      });

      //Render hCaptcha widget and provide necessary callbacks - hCaptcha
      const captchaId = hcaptcha.render(this.ref.current, renderParams);

      this.setState({ isRemoved: false, captchaId }, () => {
        onReady && onReady();
      });
    }

    resetCaptcha() {
      const { captchaId } = this.state;

      if (!this.isReady()) {
        return;
      }
      // Reset captcha state, removes stored token and unticks checkbox
      hcaptcha.reset(captchaId)
    }

    removeCaptcha(callback) {
      const { captchaId } = this.state;

      if (!this.isReady()) {
        return;
      }

      this.setState({ isRemoved: true }, () => {
        hcaptcha.remove(captchaId);
        callback && callback()
      });
    }

    handleOnLoad () {
      this.setState({ isApiReady: true }, () => {

        // render captcha and wait for captcha id
        this.renderCaptcha(() => {
            // trigger onLoad if it exists
            const { onLoad } = this.props;
            if (onLoad) onLoad();
        });
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
      const { captchaId } = this.state;

      if (!this.isReady()) {
        return;
      }

      hcaptcha.reset(captchaId) // If hCaptcha runs into error, reset captcha - hCaptcha

      if (onExpire) onExpire();
    }

    handleError (event) {
      const { onError } = this.props;
      const { captchaId } = this.state;

      if (this.isReady()) {
        // If hCaptcha runs into error, reset captcha - hCaptcha
        hcaptcha.reset(captchaId);
      }

      if (onError) onError(event);
    }

    isReady () {
      const { isApiReady, isRemoved } = this.state;

      return isApiReady && !isRemoved;
    }

    handleOpen () {
      if (!this.isReady() || !this.props.onOpen) {
        return;
      }

      this.props.onOpen();
    }

    handleClose () {
      if (!this.isReady() || !this.props.onClose) {
        return;
      }

      this.props.onClose();
    }

    handleChallengeExpired () {
      if (!this.isReady() || !this.props.onChalExpired) {
        return;
      }

      this.props.onChalExpired();
    }

    execute (opts = null) {
      const { captchaId } = this.state;

      if (!this.isReady()) {
        return;
      }

      if (opts && typeof opts !== "object") {
        opts = null;
      }

      return hcaptcha.execute(captchaId, opts);
    }

    setData (data) {
      const { captchaId } = this.state;

      if (!this.isReady()) {
        return;
      }

      if (data && typeof data !== "object") {
        data = null;
      }

      hcaptcha.setData(captchaId, data);
    }

    getResponse() {
      return hcaptcha.getResponse(this.state.captchaId);
    }

    getRespKey() {
      return hcaptcha.getRespKey(this.state.captchaId)
    }

    render () {
      const { elementId } = this.state;
      return <div ref={this.ref} id={elementId}></div>
    }
  }

export default HCaptcha;
