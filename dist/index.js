"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var React = require('react'); // Create script to init hCaptcha


var onLoadListeners = [];
var captchaScriptCreated = false; // Generate hCaptcha API Script

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
    script.src += "&hl=".concat(hl);
  }

  if (reCaptchaCompat === false) {
    script.src += '&recaptchacompat=off';
  }

  document.head.appendChild(script);
};

var HCaptcha = /*#__PURE__*/function (_React$Component) {
  _inherits(HCaptcha, _React$Component);

  var _super = _createSuper(HCaptcha);

  function HCaptcha(props) {
    var _this;

    _classCallCheck(this, HCaptcha);

    _this = _super.call(this, props);
    var _props$id = props.id,
        id = _props$id === void 0 ? null : _props$id;

    _this._announceDeprecation(props); // API Methods


    _this.renderCaptcha = _this.renderCaptcha.bind(_assertThisInitialized(_this));
    _this.resetCaptcha = _this.resetCaptcha.bind(_assertThisInitialized(_this));
    _this.removeCaptcha = _this.removeCaptcha.bind(_assertThisInitialized(_this)); // Event Handlers

    _this.handleOnLoad = _this.handleOnLoad.bind(_assertThisInitialized(_this));
    _this.handleSubmit = _this.handleSubmit.bind(_assertThisInitialized(_this));
    _this.handleExpire = _this.handleExpire.bind(_assertThisInitialized(_this));
    _this.handleError = _this.handleError.bind(_assertThisInitialized(_this));
    var isApiReady = typeof hcaptcha !== 'undefined';
    if (!isApiReady) captchaScriptCreated = false;
    _this.ref = React.createRef();
    _this.state = {
      isApiReady: isApiReady,
      isRemoved: false,
      elementId: id,
      captchaId: ''
    };
    return _this;
  }
  /**
   * Should announce deprecations (if any) when in development mode
   * @param props
   * @private
   */


  _createClass(HCaptcha, [{
    key: "_announceDeprecation",
    value: function _announceDeprecation(props) {
      try {
        if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
          // dev code
          if (props.id && console.warn) {
            console.warn('@hCaptcha/react-hcaptcha: id prop is deprecated as of 0.3.1. It will be removed in the future. Instead you can set the id on the <HCaptcha id="hCaptchaId" /> component itself if needed.');
          }
        }
      } catch (_unused) {// silence
      }
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      //Once captcha is mounted intialize hCaptcha - hCaptcha
      var _this$props = this.props,
          languageOverride = _this$props.languageOverride,
          reCaptchaCompat = _this$props.reCaptchaCompat;
      var isApiReady = this.state.isApiReady;

      if (!isApiReady) {
        //Check if hCaptcha has already been loaded, if not create script tag and wait to render captcha
        if (!captchaScriptCreated) {
          // Only create the script tag once, use a global variable to track
          captchaScriptCreated = true;
          CaptchaScript(languageOverride, reCaptchaCompat);
        } // Add onload callback to global onload listeners


        onLoadListeners.push(this.handleOnLoad);
      } else {
        this.renderCaptcha();
      }
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      var _this$state = this.state,
          isApiReady = _this$state.isApiReady,
          isRemoved = _this$state.isRemoved,
          captchaId = _this$state.captchaId;
      if (!isApiReady || isRemoved) return; // Reset any stored variables / timers when unmounting

      hcaptcha.reset(captchaId);
      hcaptcha.remove(captchaId);
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps, nextState) {
      // Prevent component re-rendering when these internal state variables are updated
      if (this.state.isApiReady !== nextState.isApiReady || this.state.isRemoved !== nextState.isRemoved) {
        return false;
      }

      return true;
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      var _this2 = this;

      var endpoint = this.props.endpoint; // Prop Keys that could change

      var keys = ['sitekey', 'size', 'theme', 'tabindex', 'languageOverride', 'endpoint']; // See if any props changed during component update

      var match = keys.every(function (key) {
        return prevProps[key] === _this2.props[key];
      }); // If they have changed, remove current captcha and render a new one

      if (!match) {
        this.removeCaptcha();
        this.renderCaptcha();
      }
    }
  }, {
    key: "renderCaptcha",
    value: function renderCaptcha() {
      var isApiReady = this.state.isApiReady;
      if (!isApiReady) return; //Render hCaptcha widget and provide necessary callbacks - hCaptcha

      var captchaId = hcaptcha.render(this.ref.current, _objectSpread(_objectSpread({}, this.props), {}, {
        "error-callback": this.handleError,
        "expired-callback": this.handleExpire,
        "callback": this.handleSubmit
      }));
      this.setState({
        isRemoved: false,
        captchaId: captchaId
      });
    }
  }, {
    key: "resetCaptcha",
    value: function resetCaptcha() {
      var _this$state2 = this.state,
          isApiReady = _this$state2.isApiReady,
          isRemoved = _this$state2.isRemoved,
          captchaId = _this$state2.captchaId;
      if (!isApiReady || isRemoved) return; // Reset captcha state, removes stored token and unticks checkbox

      hcaptcha.reset(captchaId);
    }
  }, {
    key: "removeCaptcha",
    value: function removeCaptcha() {
      var _this$state3 = this.state,
          isApiReady = _this$state3.isApiReady,
          isRemoved = _this$state3.isRemoved,
          captchaId = _this$state3.captchaId;
      if (!isApiReady || isRemoved) return;
      this.setState({
        isRemoved: true
      }, function () {
        hcaptcha.remove(captchaId);
      });
    }
  }, {
    key: "handleOnLoad",
    value: function handleOnLoad() {
      var _this3 = this;

      this.setState({
        isApiReady: true
      }, function () {
        _this3.renderCaptcha();
      });
    }
  }, {
    key: "handleSubmit",
    value: function handleSubmit(event) {
      var onVerify = this.props.onVerify;
      var _this$state4 = this.state,
          isRemoved = _this$state4.isRemoved,
          captchaId = _this$state4.captchaId;
      if (typeof hcaptcha === 'undefined' || isRemoved) return;
      var token = hcaptcha.getResponse(captchaId); //Get response token from hCaptcha widget

      var ekey = hcaptcha.getRespKey(captchaId); //Get current challenge session id from hCaptcha widget

      onVerify(token, ekey); //Dispatch event to verify user response
    }
  }, {
    key: "handleExpire",
    value: function handleExpire() {
      var onExpire = this.props.onExpire;
      var _this$state5 = this.state,
          isApiReady = _this$state5.isApiReady,
          isRemoved = _this$state5.isRemoved,
          captchaId = _this$state5.captchaId;
      if (!isApiReady || isRemoved) return;
      hcaptcha.reset(captchaId); // If hCaptcha runs into error, reset captcha - hCaptcha

      if (onExpire) onExpire();
    }
  }, {
    key: "handleError",
    value: function handleError(event) {
      var onError = this.props.onError;
      var _this$state6 = this.state,
          isApiReady = _this$state6.isApiReady,
          isRemoved = _this$state6.isRemoved,
          captchaId = _this$state6.captchaId;
      if (!isApiReady || isRemoved) return;
      hcaptcha.reset(captchaId); // If hCaptcha runs into error, reset captcha - hCaptcha

      if (onError) onError(event);
    }
  }, {
    key: "execute",
    value: function execute() {
      var _this$state7 = this.state,
          isApiReady = _this$state7.isApiReady,
          isRemoved = _this$state7.isRemoved,
          captchaId = _this$state7.captchaId;
      if (!isApiReady || isRemoved) return;
      hcaptcha.execute(captchaId);
    }
  }, {
    key: "render",
    value: function render() {
      // Keep elementId for backwards compatibility
      var elementId = this.state.elementId;
      return /*#__PURE__*/React.createElement("div", {
        ref: this.ref,
        id: elementId
      });
    }
  }]);

  return HCaptcha;
}(React.Component);

module.exports = HCaptcha;