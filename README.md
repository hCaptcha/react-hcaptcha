# React hCaptcha Component Library

## Description
hCaptcha Component Library for ReactJS.

[hCaptcha](https://www.hcaptcha.com) is an easy to use replacement for reCAPTCHA that helps monetize your website.

Sign up at [hCaptcha](https://wwww.hcaptcha.com) to get your sitekey today. **You need a sitekey to use this captcha solution.**

## Installation
You can install this library via npm with:
```
npm install react-hcaptcha --save
```

### Usage

#### Basic Usage
```
<your-cool-form>
    <hCaptcha :sitekey="**Your sitekey here**" onVerify={this.onVerifyCaptcha}></hCaptcha>
</your-cool-form>
```

The two required props are the sitekey and root component. The component will automatically include and load the
hCaptcha API library and append it to the root component. This is designed for ease of use with the hCaptcha API!

Props include:
- sitekey: String, **Required**
    - This is your sitekey. It allows you to load hCaptcha, and to configure options like difficulty on the hCaptcha dashboard.
- size: String (normal, compact, invisible)
    - This specifies the "size" of the component. hCaptcha allows you to decide how big the component will appear on render. Defaults to normal.
      Want a smaller checkbox? Use compact! Invisible does not show a hCaptcha button, and instead pops up on form submit.
- theme: String (light, dark)
    - hCaptcha supports both a light and dark theme. If no theme is inherently set, the captcha will always default to light.
- tabindex: Integer
    - Set the tabindex of the widget and popup. When appropriate, this can make navigation of your site more intuitive. This always defaults to 0.

The component emits events related to verification and expiration. Simply catch these events in the parent component: `onVerify`, `onExpire`, `onError` and handle the events as you choose. The captcha will automatically reset on error, but still emits an error.

**NOTE**: Make sure to reset the hCaptcha state when you submit your form by calling the method `.resetCaptcha` on your hCaptcha React Component! Passcodes are one-time use, so if your user submits the same passcode twice then it will be rejected by the server the second time.

Please refer to the demo for examples of basic usage and an invisible hCaptcha.