import * as React from 'react';
import { generateQuery, getFrame, getMountElement } from './utils.js';

const SCRIPT_ID = 'hcaptcha-api-script-id';
const HCAPTCHA_LOAD_FN_NAME = 'hcaptchaOnLoad';

// Prevent loading API script multiple times
const scripts = [];

// Generate hCaptcha API script
const mountCaptchaScript = (params = {}) => {
  const element = getMountElement(params.scriptLocation);
  delete params.scriptLocation;

  const frame = getFrame(element);
  const script = scripts.find(({ scope }) => scope === frame.window);

  if (frame.document.getElementById(SCRIPT_ID) && script) {
    // API was already requested
    return script.promise;
  }

  const promise = new Promise((resolve, reject) => {
    // Create global onload callback
    frame.window[HCAPTCHA_LOAD_FN_NAME] = resolve;

    const domain = params.apihost || "https://js.hcaptcha.com";
    delete params.apihost;

    const script = frame.document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `${domain}/1/api.js?render=explicit&onload=${HCAPTCHA_LOAD_FN_NAME}`;

    script.async = params.loadAsync !== undefined? params.loadAsync : true;
    delete params.loadAsync;

    script.onerror = (event) => reject('script-error');

    const query = generateQuery(params);
    script.src += query !== ""? `&${query}` : "";

    element.appendChild(script);
  });

  scripts.push({ promise, scope: frame.window });

  return promise;
};


class HCaptcha extends React.Component {
    constructor (props) {
      super(props);

      /**
       * Internal reference to track hCaptcha API
       *
       * Required as window is relative to initialization in application
       * not where the script and iFrames have been loaded.
       */
      this._hcaptcha = undefined;

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

      this.ref = React.createRef();
      this.apiScriptRequested = false;

      this.state = {
        isApiReady: false,
        isRemoved: false,
        elementId: props.id,
        captchaId: ''
      }
    }

    componentDidMount () { // Once captcha is mounted intialize hCaptcha - hCaptcha
      const element = getMountElement(this.props.scriptLocation);
      const frame = getFrame(element);
      this._hcaptcha = frame.window.hcaptcha || undefined;

      const isApiReady = typeof this._hcaptcha !== 'undefined';

      /*
       * Check if hCaptcha has already been loaded,
       * If Yes, render the captcha
       * If No, create script tag and wait to render the captcha
       */
      if (isApiReady) {
        this.setState(
          {
            isApiReady: true
          },
          () => {
            this.renderCaptcha();
          }
        );

        return;
      }

      this.loadCaptcha();
    }

    componentWillUnmount() {
      const { captchaId } = this.state;
      const hcaptcha = this._hcaptcha;

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
        custom,
        loadAsync,
        scriptLocation
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
        custom,
        loadAsync,
        scriptLocation,
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

      const hcaptcha = this._hcaptcha;
      //Render hCaptcha widget and provide necessary callbacks - hCaptcha
      const captchaId = hcaptcha.render(this.ref.current, renderParams);

      this.setState({ isRemoved: false, captchaId }, () => {
        onReady && onReady();
      });
    }

    resetCaptcha() {
      const { captchaId } = this.state;
      const hcaptcha = this._hcaptcha;

      if (!this.isReady()) {
        return;
      }
      // Reset captcha state, removes stored token and unticks checkbox
      hcaptcha.reset(captchaId)
    }

    removeCaptcha(callback) {
      const { captchaId } = this.state;
      const hcaptcha = this._hcaptcha;

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
        const element = getMountElement(this.props.scriptLocation);
        const frame = getFrame(element);

        this._hcaptcha = frame.window.hcaptcha;

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
      const hcaptcha = this._hcaptcha;

      if (typeof hcaptcha === 'undefined' || isRemoved) return

      const token = hcaptcha.getResponse(captchaId) //Get response token from hCaptcha widget
      const ekey  = hcaptcha.getRespKey(captchaId)  //Get current challenge session id from hCaptcha widget
      if (onVerify) onVerify(token, ekey) //Dispatch event to verify user response
    }

    handleExpire () {
      const { onExpire } = this.props;
      const { captchaId } = this.state;
      const hcaptcha = this._hcaptcha;

      if (!this.isReady()) {
        return;
      }

      hcaptcha.reset(captchaId) // If hCaptcha runs into error, reset captcha - hCaptcha

      if (onExpire) onExpire();
    }

    handleError (event) {
      const { onError } = this.props;
      const { captchaId } = this.state;
      const hcaptcha = this._hcaptcha;

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
      const hcaptcha = this._hcaptcha;

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
      const hcaptcha = this._hcaptcha;

      if (!this.isReady()) {
        return;
      }

      if (data && typeof data !== "object") {
        data = null;
      }

      hcaptcha.setData(captchaId, data);
    }

    getResponse() {
      const hcaptcha = this._hcaptcha;
      return hcaptcha.getResponse(this.state.captchaId);
    }

    getRespKey() {
      const hcaptcha = this._hcaptcha;
      return hcaptcha.getRespKey(this.state.captchaId)
    }

    render () {
      const { elementId } = this.state;
      return <div ref={this.ref} id={elementId}></div>;
    }
  }

export default HCaptcha;
