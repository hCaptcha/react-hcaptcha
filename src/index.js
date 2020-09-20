const React = require("react");

// Borrowed from https://github.com/ai/nanoid/blob/3.0.2/non-secure/index.js
// This alphabet uses `A-Za-z0-9_-` symbols. A genetic algorithm helped
// optimize the gzip compression for this alphabet.
const urlAlphabet =
  "ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW";

const nanoid = (size = 21) => {
  let id = "";
  // A compact alternative for `for (var i = 0; i < step; i++)`.
  let i = size;
  while (i--) {
    // `| 0` is more compact and faster than `Math.floor()`.
    id += urlAlphabet[(Math.random() * 64) | 0];
  }
  return id;
};

// Create script to init hCaptcha
let onLoadListeners = [];
let captchaScriptCreated = false;

// Generate hCaptcha API Script
const CaptchaScript = (hl, reCaptchaCompat) => {
  // Create global onload callback
  window.hcaptchaOnLoad = () => {
    // Iterate over onload listeners, call each listener
    onLoadListeners = onLoadListeners.filter((listener) => {
      listener();
      return false;
    });
  };

  let script = document.createElement("script");
  script.src =
    "https://hcaptcha.com/1/api.js?render=explicit&onload=hcaptchaOnLoad";
  script.async = true;
  if (hl) {
    script.src += `&hl=${hl}`;
  }
  if (reCaptchaCompat === false) {
    script.src += "&recaptchacompat=off";
  }

  document.head.appendChild(script);
};

const HCaptcha = React.forwardRef(
  (
    {
      reCaptchaCompat,
      onVerify,
      onExpire,
      onError,
      sitekey,
      size,
      theme,
      tabindex,
      languageOverride,
      endpoint,
      id,
    },
    ref
  ) => {
    const [isApiReady, setIsApiReady] = React.useState(
      typeof hcaptcha !== "undefined"
    );

    const [isRemoved, setIsRemoved] = React.useState(false);

    const [elementId, setElementId] = React.useState(`hcaptcha-${nanoid()}`);

    const [captchaId, setCaptchaId] = React.useState();

    React.useEffect(() => {
      if (id) {
        setElementId(id);
      }
    }, [id]);

    React.useEffect(() => {
      if (!isApiReady) {
        //Check if hCaptcha has already been loaded, if not create script tag and wait to render captcha elementID - hCaptcha

        if (!captchaScriptCreated) {
          // Only create the script tag once, use a global variable to track
          captchaScriptCreated = true;
          CaptchaScript(languageOverride, reCaptchaCompat);
        }

        // Add onload callback to global onload listeners
        onLoadListeners.push(handleOnLoad);
      } else {
        renderCaptcha();
      }

      return () => {
        if (!isApiReady || isRemoved) return;

        // Reset any stored variables / timers when unmounting
        hcaptcha.reset(captchaId);
        hcaptcha.remove(captchaId);
      };
    }, []);

    React.useEffect(() => {
      removeCaptcha();
      renderCaptcha();
    }, [sitekey, size, theme, tabindex, languageOverride, endpoint]);

    const handleOnLoad = () => {
      setIsApiReady(true);
    };

    const renderCaptcha = () => {
      if (!isApiReady) return;

      //Render hCaptcha widget and provide neccessary callbacks - hCaptcha
      const captchaId = hcaptcha.render(document.getElementById(elementId), {
        reCaptchaCompat,
        onVerify,
        onExpire,
        onError,
        sitekey,
        size,
        theme,
        tabindex,
        languageOverride,
        endpoint,
        id,
        callback: handleSubmit,
        "error-callback": handleError,
        "expired-callback": handleExpire,
      });

      setIsRemoved(false);
      setCaptchaId(captchaId);
    };

    const removeCaptcha = () => {
      if (!isApiReady || isRemoved) return;
      setIsRemoved(true);
    };

    React.useEffect(() => {
      if (isRemoved) {
        hcaptcha.remove(captchaId);
      }
    }, [isRemoved]);

    React.useEffect(() => {
      if (isApiReady) {
        renderCaptcha();
      }
    }, [isApiReady]);

    const handleSubmit = () => {
      if (typeof hcaptcha === "undefined" || isRemoved) return;
      // Get response token from hCaptcha widget - hCaptcha
      const token = hcaptcha.getResponse(captchaId);
      // Dispatch event to verify user response
      onVerify(token);
    };

    const handleExpire = () => {
      if (!isApiReady || isRemoved) return;
      // If hCaptcha runs into error, reset captcha - hCaptcha
      hcaptcha.reset(captchaId);
      if (onExpire) onExpire();
    };

    const handleError = (event) => {
      if (!isApiReady || isRemoved) return;
      // If hCaptcha runs into error, reset captcha - hCaptcha
      hcaptcha.reset(captchaId);
      if (onError) onError(event);
    };

    React.useImperativeHandle(
      ref,
      () => ({
        resetCaptcha: () => {
          if (!isApiReady || isRemoved) return;
          // Reset captcha state, removes stored token and unticks checkbox
          hcaptcha.reset(captchaId);
        },
        execute: () => {
          if (!isApiReady || isRemoved) return;

          hcaptcha.execute(captchaId);
        },
      }),
      [isApiReady, isRemoved, captchaId]
    );

    return <div id={elementId}></div>;
  }
);

module.exports = HCaptcha;
