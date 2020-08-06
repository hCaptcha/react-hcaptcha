'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');

// Borrowed from https://github.com/ai/nanoid/blob/3.0.2/non-secure/index.js
// This alphabet uses `A-Za-z0-9_-` symbols. A genetic algorithm helped
// optimize the gzip compression for this alphabet.
var urlAlphabet = 'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW';

var nanoid = function nanoid() {
  var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 21;

  var id = '';
  // A compact alternative for `for (var i = 0; i < step; i++)`.
  var i = size;
  while (i--) {
    // `| 0` is more compact and faster than `Math.floor()`.
    id += urlAlphabet[Math.random() * 64 | 0];
  }
  return id;
};

// Create script to init hCaptcha
var onLoadListeners = [];
var captchaScriptCreated = false;

// Generate hCaptcha API Script
var CaptchaScript = function CaptchaScript(hl, reCaptchaCompat) {
  // Create global onload callback
  window.hcaptchaOnLoad = function () {
    // Iterate over onload listeners, call each listener
    onLoadListeners = onLoadListeners.filter(function (listener) {
      listener();
      return false;
    });
  };

  var script = document.createElement("script");
  script.src = "https://hcaptcha.com/1/api.js?render=explicit&onload=hcaptchaOnLoad";
  script.async = true;
  if (hl) {
    script.src += '&hl=' + hl;
  }
  if (reCaptchaCompat === false) {
    script.src += '&recaptchacompat=off';
  }

  document.head.appendChild(script);
};

var HCaptcha = function (_React$Component) {
  _inherits(HCaptcha, _React$Component);

  function HCaptcha(props) {
    _classCallCheck(this, HCaptcha);

    var _this = _possibleConstructorReturn(this, (HCaptcha.__proto__ || Object.getPrototypeOf(HCaptcha)).call(this, props));

    var _props$id = props.id,
        id = _props$id === undefined ? null : _props$id;

    // API Methods

    _this.renderCaptcha = _this.renderCaptcha.bind(_this);
    _this.resetCaptcha = _this.resetCaptcha.bind(_this);
    _this.removeCaptcha = _this.removeCaptcha.bind(_this);

    // Event Handlers
    _this.handleOnLoad = _this.handleOnLoad.bind(_this);
    _this.handleSubmit = _this.handleSubmit.bind(_this);
    _this.handleExpire = _this.handleExpire.bind(_this);
    _this.handleError = _this.handleError.bind(_this);

    var isApiReady = typeof hcaptcha !== 'undefined';

    if (!isApiReady) captchaScriptCreated = false;

    _this.state = {
      isApiReady: isApiReady,
      isRemoved: false,
      elementId: id || 'hcaptcha-' + nanoid(),
      captchaId: ''
    };
    return _this;
  }

  _createClass(HCaptcha, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      //Once captcha is mounted intialize hCaptcha - hCaptcha
      var _props = this.props,
          languageOverride = _props.languageOverride,
          reCaptchaCompat = _props.reCaptchaCompat;
      var _state = this.state,
          isApiReady = _state.isApiReady,
          elementId = _state.elementId;


      if (!isApiReady) {
        //Check if hCaptcha has already been loaded, if not create script tag and wait to render captcha elementID - hCaptcha

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
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      var _state2 = this.state,
          isApiReady = _state2.isApiReady,
          isRemoved = _state2.isRemoved,
          captchaId = _state2.captchaId;

      if (!isApiReady || isRemoved) return;

      // Reset any stored variables / timers when unmounting
      hcaptcha.reset(captchaId);
      hcaptcha.remove(captchaId);
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      // Prevent component re-rendering when these internal state variables are updated
      if (this.state.isApiReady !== nextState.isApiReady || this.state.isRemoved !== nextState.isRemoved) {
        return false;
      }

      return true;
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      var _this2 = this;

      var endpoint = this.props.endpoint;

      // Prop Keys that could change

      var keys = ['sitekey', 'size', 'theme', 'tabindex', 'languageOverride', 'endpoint'];
      // See if any props changed during component update
      var match = keys.every(function (key) {
        return prevProps[key] === _this2.props[key];
      });

      // If they have changed, remove current captcha and render a new one
      if (!match) {
        this.removeCaptcha();
        this.renderCaptcha();
      }
    }
  }, {
    key: 'renderCaptcha',
    value: function renderCaptcha() {
      var _state3 = this.state,
          isApiReady = _state3.isApiReady,
          elementId = _state3.elementId;

      if (!isApiReady) return;

      //Render hCaptcha widget and provide neccessary callbacks - hCaptcha
      var captchaId = hcaptcha.render(document.getElementById(elementId), _extends({}, this.props, {
        "error-callback": this.handleError,
        "expired-callback": this.handleExpire,
        "callback": this.handleSubmit
      }));

      this.setState({ isRemoved: false, captchaId: captchaId });
    }
  }, {
    key: 'resetCaptcha',
    value: function resetCaptcha() {
      var _state4 = this.state,
          isApiReady = _state4.isApiReady,
          isRemoved = _state4.isRemoved,
          captchaId = _state4.captchaId;


      if (!isApiReady || isRemoved) return;
      // Reset captcha state, removes stored token and unticks checkbox
      hcaptcha.reset(captchaId);
    }
  }, {
    key: 'removeCaptcha',
    value: function removeCaptcha() {
      var _state5 = this.state,
          isApiReady = _state5.isApiReady,
          isRemoved = _state5.isRemoved,
          captchaId = _state5.captchaId;


      if (!isApiReady || isRemoved) return;

      this.setState({ isRemoved: true }, function () {
        hcaptcha.remove(captchaId);
      });
    }
  }, {
    key: 'handleOnLoad',
    value: function handleOnLoad() {
      var _this3 = this;

      this.setState({ isApiReady: true }, function () {
        _this3.renderCaptcha();
      });
    }
  }, {
    key: 'handleSubmit',
    value: function handleSubmit(event) {
      var onVerify = this.props.onVerify;
      var _state6 = this.state,
          isRemoved = _state6.isRemoved,
          captchaId = _state6.captchaId;


      if (typeof hcaptcha === 'undefined' || isRemoved) return;

      var token = hcaptcha.getResponse(captchaId); //Get response token from hCaptcha widget - hCaptcha
      onVerify(token); //Dispatch event to verify user response
    }
  }, {
    key: 'handleExpire',
    value: function handleExpire() {
      var onExpire = this.props.onExpire;
      var _state7 = this.state,
          isApiReady = _state7.isApiReady,
          isRemoved = _state7.isRemoved,
          captchaId = _state7.captchaId;


      if (!isApiReady || isRemoved) return;
      hcaptcha.reset(captchaId); // If hCaptcha runs into error, reset captcha - hCaptcha

      if (onExpire) onExpire();
    }
  }, {
    key: 'handleError',
    value: function handleError(event) {
      var onError = this.props.onError;
      var _state8 = this.state,
          isApiReady = _state8.isApiReady,
          isRemoved = _state8.isRemoved,
          captchaId = _state8.captchaId;


      if (!isApiReady || isRemoved) return;

      hcaptcha.reset(captchaId); // If hCaptcha runs into error, reset captcha - hCaptcha
      if (onError) onError(event);
    }
  }, {
    key: 'execute',
    value: function execute() {
      var _state9 = this.state,
          isApiReady = _state9.isApiReady,
          isRemoved = _state9.isRemoved,
          captchaId = _state9.captchaId;


      if (!isApiReady || isRemoved) return;

      hcaptcha.execute(captchaId);
    }
  }, {
    key: 'render',
    value: function render() {
      var elementId = this.state.elementId;

      return React.createElement('div', { id: elementId });
    }
  }]);

  return HCaptcha;
}(React.Component);

module.exports = HCaptcha;