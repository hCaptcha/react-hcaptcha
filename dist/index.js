'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _HCaptcha = require('./component/HCaptcha');

var _HCaptcha2 = _interopRequireDefault(_HCaptcha);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_reactDom2.default.render(_react2.default.createElement(
  'div',
  null,
  _react2.default.createElement(
    'h1',
    null,
    'HCaptcha React Demo'
  ),
  _react2.default.createElement(
    'div',
    { id: 'captcha' },
    _react2.default.createElement(_HCaptcha2.default, null)
  )
), document.getElementById('app'));

module.hot.accept();