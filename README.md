# React hCaptcha Component Library

## Description

hCaptcha Component Library for ReactJS.

[hCaptcha](https://www.hcaptcha.com) is a drop-replacement for reCAPTCHA that protects user privacy, rewards websites, and helps companies get their data labeled.

Sign up at [hCaptcha](https://www.hcaptcha.com) to get your sitekey today. **You need a sitekey to use this library.**

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
      onVerify={(token,ekey) => handleVerificationSuccess(token, ekey)}
    />
</FormComponent>
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

#### Programmatic Usage
In the event you want to call the hCaptcha client API directly, you can do so by using the hook `useRef` and waiting for `onLoad` to be called. By waiting for `onLoad` the hCaptcha API will be ready and the hCaptcha client will have been setup. See the following example:

```js
import { useEffect, useRef, useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function Form() {
  const [token, setToken] = useState(null);
  const captchaRef = useRef(null);

  const onLoad = () => {
    // this reaches out to the hCaptcha JS API and runs the
    // execute function on it. you can use other functions as
    // documented here:
    // https://docs.hcaptcha.com/configuration#jsapi
    captchaRef.current.execute();
  };

  useEffect(() => {

    if (token)
      console.log(`hCaptcha Token: ${token}`);

  }, [token]);

  return (
    <form>
      <HCaptcha
        sitekey="your-sitekey"
        onLoad={onLoad}
        onVerify={setToken}
        ref={captchaRef}
      />
    </form>
  );
}
```

#### Advanced usage

In most real-world implementations, you'll probably be using a form library such as [Formik](https://github.com/jaredpalmer/formik) or [React Hook Form](https://github.com/react-hook-form/react-hook-form).

In these instances, you'll most likely want to use `ref` to handle the callbacks as well as handle field-level validation of a `captcha` field. For an example of this, you can view this [CodeSandbox](https://codesandbox.io/s/react-hcaptchaform-example-forked-ngxge?file=/src/Form.jsx).  This `ref` will point to an instance of the [hCaptcha API](https://docs.hcaptcha.com/configuration#jsapi) where can you interact directly with it.

#### Passing in fields like `rqdata` to `execute()`

Passing an object into the `execute(yourObj)` call will send it through to the underlying JS API. This enables support for Enterprise features like `rqdata`. A simple example is below:

```
const {sitekey, rqdata} = props;
const captchaRef = React.useRef<HCaptcha>(null);

const onLoad = () => {
  const executePayload = {};
  if (rqdata) {
    executePayload['rqdata'] = rqdata;
  }
  captchaRef.current?.execute(executePayload);
};

return <HCaptcha ref={captchaRef} onLoad={onLoad} sitekey={sitekey} {...props} />;
```


### Props

|Name|Values/Type|Required|Default|Description|
|---|---|---|---|---|
|`sitekey`|String|**Yes**|`-`|This is your sitekey, this allows you to load captcha. If you need a sitekey, please visit [hCaptcha](https://www.hcaptcha.com), and sign up to get your sitekey.|
|`size`|String (normal, compact, invisible)|No|`normal`|This specifies the "size" of the component. hCaptcha allows you to decide how big the component will appear on render, this always defaults to normal.|
|`theme`|String (light, dark)|No|`light`|hCaptcha supports both a light and dark theme. If no theme is inherently set, the captcha will always default to light.|
|`tabindex`|Integer|No|`0`|Set the tabindex of the widget and popup. When appropriate, this can make navigation of your site more intuitive.|
|`languageOverride`|String (ISO 639-2 code)|No|`auto`|hCaptcha auto-detects language via the user's browser. This overrides that to set a default UI language. See [language codes](https://hcaptcha.com/docs/languages).|
|`reCaptchaCompat`|Boolean|No|`true`|Disable drop-in replacement for reCAPTCHA with `false` to prevent hCaptcha from injecting into `window.grecaptcha`.|
|`id`|String|No|`random id`|Manually set the ID of the hCaptcha component. Make sure each hCaptcha component generated on a single page has its own unique ID when using this prop.|
|`apihost`|String|No|`-`|See enterprise docs.|
|`assethost`|String|No|`-`|See enterprise docs.|
|`endpoint`|String|No|`-`|See enterprise docs.|
|`host`|String|No|`-`|See enterprise docs.|
|`imghost`|String|No|`-`|See enterprise docs.|
|`reportapi`|String|No|`-`|See enterprise docs.|
|`sentry`|String|No|`-`|See enterprise docs.|
|`custom`|Boolean|No|`-`|See enterprise docs.|

### Events

|Event|Params|Description|
|---|---|---|
|`onError`|`err`|When an error occurs. Component will reset immediately after an error.|
|`onVerify`|`token, eKey`|When challenge is completed. The response `token` and an `eKey` (session id) are passed along.|
|`onExpire`|-|When the current token expires.|
|`onLoad`|-|When the hCaptcha API loads.|
|`onOpen`|-|When the user display of a challenge starts.|
|`onClose`|-|When the user dismisses a challenge.|
|`onChalExpired`|-|When the user display of a challenge times out with no answer.|

### Methods

|Method|Description|
|---|---|
|`execute()`|Programmatically trigger a challenge request. Additionally, this method can be run asynchronously and returns a promise with the `token` and `eKey` when the challenge is completed.|
|`getRespKey()`|Get the current challenge reference ID|
|`getResponse()`|Get the current challenge response token from completed challenge|
|`resetCaptcha()`|Reset the current challenge|
|`setData()`|See enterprise docs.|


**NOTE**: Make sure to reset the hCaptcha state when you submit your form by calling the method `.resetCaptcha` on your hCaptcha React Component! Passcodes are one-time use, so if your user submits the same passcode twice then it will be rejected by the server the second time.

Please refer to the demo for examples of basic usage and an invisible hCaptcha.

Alternatively, see [this sandbox code](https://codesandbox.io/s/react-hcaptchaform-example-invisible-f7ekt) for a quick form example of invisible hCaptcha on a form submit button.

Please note that "invisible" simply means that no hCaptcha button will be rendered. Whether a challenge shows up will depend on the sitekey difficulty level. Note to hCaptcha Enterprise ([BotStop](https://www.botstop.com)) users: select "Passive" or "99.9% Passive" modes to get this No-CAPTCHA behavior.

---

### Note for maintainers

#### Scripts

* `npm run start` - will start the demo app with hot reload
* `npm run test` - will test the library: unit tests
* `npm run build` - will build the production version


#### Publishing

To publish a new version, follow the next steps:
1. Bump the version in `package.json`
2. Create a [Github Release](https://docs.github.com/en/free-pro-team@latest/github/administering-a-repository/managing-releases-in-a-repository#creating-a-release) with version from step 1 **without** a prefix such as `v` (e.g. `1.0.3`)
  * `publish` workflow will be triggered which will: build, test and deploy the package to the [npm @hcaptcha/react-hcaptcha](https://www.npmjs.com/package/@hcaptcha/react-hcaptcha).


#### Running locally for development

Please see: [Local Development Notes](https://docs.hcaptcha.com/#localdev).

Summary:

`sudo echo "127.0.0.1 fakelocal.com" >> /private/etc/hosts`

`npm start -- --disable-host-check`

open [http://fakelocal.com:9000](http://fakelocal.com:9000) to start the example.
