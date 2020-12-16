# React hCaptcha Component Library

## Description

hCaptcha Component Library for ReactJS.

[hCaptcha](https://www.hcaptcha.com) is a drop-replacement for reCAPTCHA that protects user privacy, rewards websites, and helps companies get their data labeled.

Sign up at [hCaptcha](https://www.hcaptcha.com) to get your sitekey today. **You need a sitekey to use this captcha solution.**

## Installation

You can install this library via npm with:

```
npm install @hcaptcha/react-hcaptcha --save
```

### Usage
The two requirements for usage are the `sitekey` [prop](#props) and a `parent component` such as a `<form />`. The component will automatically include and load the
hCaptcha API library and append it to the parent component. This is designed for ease of use with the hCaptcha API!

#### Basic Usage

```js
import HCaptcha from '@hcaptcha/react-hcaptcha';

<FormComponent>
    <HCaptcha
      sitekey="your-sitekey"
      onVerify={token => handleVerificationSuccess(token, ekey)}
    />
</FormComponent>
```

#### Usage with TypeScript
Add the types from DefinitelyTyped

```
npm i -D @types/hcaptcha__react-hcaptcha
```

**A note about TypeScript usage:** If you want to reassign the component name, you could consider making a util that imports the component, then re-exports it as a default. Example:

```ts
// utils/captcha.ts
import HCaptcha from '@hcaptcha/react-hcaptcha';
export default HCaptcha;

// MyFormComponent.tsx
import { default as RenamedCaptcha } from '../utils/captcha';
<FormComponent>
  <RenamedCaptcha sitekey="your-sitekey" />
</FormComponent>
```

#### Advanced usage

In most real-world implementations, you'll probably be using a form library such as [Formik](https://github.com/jaredpalmer/formik) or [React Hook Form](https://github.com/react-hook-form/react-hook-form).

In these instances, you'll most likely want to use `ref` to handle the callbacks as well as handle field-level validation of a `captcha` field. For an example of this, you can view this [CodeSandbox](https://codesandbox.io/s/react-hcaptchaform-example-forked-ngxge?file=/src/Form.jsx).  This `ref` will point to an instance of the [hCaptcha API](https://docs.hcaptcha.com/configuration#jsapi) where can you interact directly with it.

### Props

- sitekey: String, **Required**
  - This is your sitekey. It allows you to load hCaptcha, and to configure options like difficulty on the hCaptcha dashboard.
- size: String (normal, compact, invisible)
  - This specifies the "size" of the component. hCaptcha allows you to decide how big the component will appear on render. Defaults to normal.
    Want a smaller checkbox? Use compact! Invisible does not show a hCaptcha button, and instead pops up on form submit.
- theme: String (light, dark)
  - hCaptcha supports both a light and dark theme. If no theme is inherently set, the captcha will always default to light.
- tabindex: Integer
  - Set the tabindex of the widget and popup. When appropriate, this can make navigation of your site more intuitive. This always defaults to 0.
- languageOverride: String
  - Manually set the language used to render text in the hCaptcha API. See [language codes](https://hcaptcha.com/docs/languages).
- id: String
  - Manually set the ID of the hCaptcha component. Make sure each hCaptcha component generated on a single page has its own unique ID when using this prop.
- reCaptchaCompat: Boolean
  - Disable drop-in replacement for reCAPTCHA with `false` to prevent hCaptcha from injecting into `window.grecaptcha`. Enabled by default.
- onVerify: Function
  - On success callback that returns two parameters: A hCaptcha response token and challenge session ID called an ekey.

The component emits events related to verification and expiration. Simply catch these events in the parent component: `onVerify`, `onExpire`, `onError` and handle the events as you choose. The captcha will automatically reset on error, but still emits an error.

**NOTE**: Make sure to reset the hCaptcha state when you submit your form by calling the method `.resetCaptcha` on your hCaptcha React Component! Passcodes are one-time use, so if your user submits the same passcode twice then it will be rejected by the server the second time.

Please refer to the demo for examples of basic usage and an invisible hCaptcha.

Alternatively, see [this sandbox code](https://codesandbox.io/s/react-hcaptchaform-example-invisible-f7ekt) for a quick form example of invisible hCaptcha on a form submit button.

Please note that "invisible" simply means that no hCaptcha button will be rendered. Whether a challenge shows up will depend on the sitekey difficulty level.

## Running locally for development

Please see: [Local Development Notes](https://docs.hcaptcha.com/#localdev).

Summary:

`sudo echo "127.0.0.1 fakelocal.com" >> /private/etc/hosts`

`npm start -- --disable-host-check`

open [http://fakelocal.com:9000](http://fakelocal.com:9000) to start the example.

## Notes to Maintainers

This repository can be found on **npm** at [@hcaptcha/react-hcaptcha](https://www.npmjs.com/package/@hcaptcha/react-hcaptcha). If any updates are committed to master the **npm** registry should be updated to reflect these changes. See steps below to update the package on **npm**:

#### Requirements

- NPM Account
- Set as a `Maintainer` of [@hcaptcha/react-hcaptcha](https://www.npmjs.com/package/@hcaptcha/react-hcaptcha)

#### Publishing

- Always update package version
- Run `npm publish` from inside the current repository

