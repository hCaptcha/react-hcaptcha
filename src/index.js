import HCaptcha from './component/HCaptcha.js';

let GlobalReact = null;
let GlobalReactDOM = null; 

if (typeof window !== 'undefined') {
    GlobalReact = window.React;
    GlobalReactDOM = window.GlobalReactDOM;
} else if (typeof global !== 'undefined') {
    GlobalReact = global.React;
    GlobalReactDOM = global.GlobalReactDOM;
}
export default HCaptcha;