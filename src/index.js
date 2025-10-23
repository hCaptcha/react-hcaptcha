import * as React from 'react';
import { hCaptchaLoader } from '@hcaptcha/loader';

import { getFrame, getMountElement } from './utils.js';


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
      this._onReady = null;

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
      this.sentryHub = null;
      this.captchaId = '';

      /**
       * Tracks the currently pending async execute() promise.
       * Stores { resolve, reject } so we can cancel on unmount/errors/etc.
       */
      this._pendingExecute = null;

      this.state = {
        isApiReady: false,
        isRemoved: false,
        elementId: props.id,
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
      const hcaptcha = this._hcaptcha;
      const captchaId = this.captchaId;

      this._cancelPendingExecute('react-component-unmounted');

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
        scriptLocation,
        scriptSource,
        secureApi,
        cleanup = true,
        userJourneys,
      } = this.props;
      
      const mountParams = {
        render: 'explicit',
        apihost,
        assethost,
        endpoint,
        hl,
        host,
        imghost,
        recaptchacompat: reCaptchaCompat === false? 'off' : null,
        reportapi,
        sentry,
        custom,
        loadAsync,
        scriptLocation,
        scriptSource,
        secureApi,
        cleanup,
        uj: userJourneys !== undefined ? userJourneys : false,
      };
      
      hCaptchaLoader(mountParams)
          .then(this.handleOnLoad, this.handleError)
          .catch(this.handleError);

      this.apiScriptRequested = true;
    }

    renderCaptcha(onRender) {
      const { onReady } = this.props;
      const { isApiReady } = this.state;
      const captchaId = this.captchaId;

      // Prevent calling hCaptcha render on two conditions:
      // • API is not ready
      // • Component has already been mounted
      if (!isApiReady || captchaId) return;
      
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
      const id = hcaptcha.render(this.ref.current, renderParams);
      this.captchaId = id;

      this.setState({ isRemoved: false }, () => {
        onRender && onRender();
        onReady && onReady();
        this._onReady && this._onReady(id);
      });
    }

    resetCaptcha() {
      const hcaptcha = this._hcaptcha;
      const captchaId = this.captchaId;

      if (!this.isReady()) {
        return;
      }

      // Reset captcha state, removes stored token and unticks checkbox
      hcaptcha.reset(captchaId)

      this._cancelPendingExecute('hcaptcha-reset');
    }

    removeCaptcha(callback) {
      const hcaptcha = this._hcaptcha;
      const captchaId = this.captchaId;

      this._cancelPendingExecute('hcaptcha-removed');

      if (!this.isReady()) {
        return;
      }

      this.setState({ isRemoved: true }, () => {
        this.captchaId = '';

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
      const { isRemoved } = this.state;
      const hcaptcha = this._hcaptcha;
      const captchaId = this.captchaId;

      if (typeof hcaptcha === 'undefined' || isRemoved) return

      const token = hcaptcha.getResponse(captchaId) //Get response token from hCaptcha widget
      const ekey  = hcaptcha.getRespKey(captchaId)  //Get current challenge session id from hCaptcha widget
      if (onVerify) onVerify(token, ekey) //Dispatch event to verify user response
    }

    handleExpire () {
      const { onExpire } = this.props;
      const hcaptcha = this._hcaptcha;
      const captchaId = this.captchaId;

      if (!this.isReady()) {
        return;
      }

      hcaptcha.reset(captchaId) // If hCaptcha runs into error, reset captcha - hCaptcha

      if (onExpire) onExpire();
    }

    handleError (event) {
      const { onError } = this.props;
      const hcaptcha = this._hcaptcha;
      const captchaId = this.captchaId;

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

    /**
     * Cancel any pending async execute() promise
     * Called when the component unmounts, errors occur, resets, etc.
     */
    _cancelPendingExecute(reason) {
      if (!this._pendingExecute) {
        return;
      }

      const pending = this._pendingExecute;
      this._pendingExecute = null;

      const error = new Error(reason);
      pending.reject(error);
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

    execute(opts = null) {

      opts = typeof opts === 'object' ? opts : null;

      try {
        const hcaptcha = this._hcaptcha;
        const captchaId = this.captchaId;

        // Is an async execute and there's already 1 pending, cancel the old one.
        if (opts && opts.async && this._pendingExecute) {
          this._cancelPendingExecute('hcaptcha-execute-replaced');
        }

        if (!this.isReady()) {
          if (opts && opts.async) {
            return new Promise((resolve, reject) => {
              this._pendingExecute = { resolve, reject };

              this._onReady = (id) => {
                if (!this._pendingExecute) {
                  return;
                }

                try {
                  const result = hcaptcha.execute(id, opts);

                  if (result && typeof result.then === 'function') {
                    result
                      .then((val) => {
                        this._pendingExecute = null;
                        resolve(val);
                      })
                      .catch((err) => {
                        this._pendingExecute = null;
                        reject(err);
                      });
                  } else {
                    this._pendingExecute = null;
                    reject(new Error('hcaptcha-execute-no-promise'));
                  }
                } catch (e) {
                  this._pendingExecute = null;
                  reject(e);
                }
              };
            });
          } else {
            // Non-async: don't return a promise.
            this._onReady = (id) => {
              hcaptcha.execute(id, opts);
            };
            
            return null;
          }
        }

        // hCaptcha is ready, execute directly.
        const result = hcaptcha.execute(captchaId, opts);

        // If it's async execute, track it.
        if (opts && opts.async && result && typeof result.then === 'function') {
          return new Promise((resolve, reject) => {
            this._pendingExecute = { resolve, reject };

            result
              .then((val) => {
                this._pendingExecute = null;
                resolve(val);
              })
              .catch((err) => {
                this._pendingExecute = null;
                reject(err);
              });
          });
        }

        return result;
      } catch (error) {
        if (opts && opts.async) {
          return Promise.reject(error);
        }
        return null;
      }
    }

    close() {
      const hcaptcha = this._hcaptcha;
      const captchaId = this.captchaId;

      this._cancelPendingExecute('hcaptcha-closed');

      if (!this.isReady()) {
        return;
      }

      return hcaptcha.close(captchaId);
    }

    setData (data) {
      const hcaptcha = this._hcaptcha;
      const captchaId = this.captchaId;

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
      return hcaptcha.getResponse(this.captchaId);
    }

    getRespKey() {
      const hcaptcha = this._hcaptcha;
      return hcaptcha.getRespKey(this.captchaId)
    }

    render () {
      const { elementId } = this.state;
      return <div ref={this.ref} id={elementId}></div>;
    }
  }

export default HCaptcha;
