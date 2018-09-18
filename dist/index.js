'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _HCaptcha = require('./component/HCaptcha.js');

var _HCaptcha2 = _interopRequireDefault(_HCaptcha);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var GlobalReact = null;
if (typeof window !== 'undefined') {
    GlobalReact = window.React;
} else if (typeof global !== 'undefined') {
    GlobalReact = global.React;
}
exports.default = _HCaptcha2.default;