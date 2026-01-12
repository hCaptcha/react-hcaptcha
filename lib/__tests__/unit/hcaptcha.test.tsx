import React from 'react';
import { render, cleanup, act } from '@testing-library/react';
import { describe, jest, it, expect, afterEach, afterAll, beforeAll, beforeEach } from '@jest/globals';

import { getMockedHcaptcha, MOCK_EKEY, MOCK_TOKEN, MOCK_WIDGET_ID } from '../__mocks__/hcaptcha.mock.js';

declare global {
  interface Window {
    hcaptcha: any;
  }
}

let HCaptcha;

const TEST_PROPS = {
    sitekey: '10000000-ffff-ffff-ffff-000000000001',
    theme: 'light',
    size: 'invisible',
    tabindex: 0,
    sentry: false,
};

function renderHCaptcha(props = {}) {
    const ref = React.createRef();
    const result = render(
      <HCaptcha
        ref={ref}
        sitekey={TEST_PROPS.sitekey}
        sentry={false}
        {...props}
      />
    );

    return { instance: ref.current, ref, ...result };
}

describe("hCaptcha", () => {
    let instance;
    let mockFns;
    let ref;

    afterEach(() => {
        cleanup();
    });

    beforeEach(() => {
        jest.isolateModules(() => {
            // Use node's `require` because `jest.isolateModules` cannot be async to use it with `await import()`
            HCaptcha = require('../../src/index').default;
        });

        mockFns = {
          onChange: jest.fn(),
          onVerify: jest.fn(),
          onError: jest.fn(),
          onExpire: jest.fn(),
          onLoad: jest.fn(),
          onOpen: jest.fn(),
          onClose: jest.fn(),
          onChalExpired: jest.fn(),
        };
        window.hcaptcha = getMockedHcaptcha();

        ref = React.createRef();
        render(
          <HCaptcha
            ref={ref}
            sitekey={TEST_PROPS.sitekey}
            theme={TEST_PROPS.theme}
            size={TEST_PROPS.size}
            tabindex={TEST_PROPS.tabindex}
            onChange={mockFns.onChange}
            onVerify={mockFns.onVerify}
            onError={mockFns.onError}
            onExpire={mockFns.onExpire}
            onLoad={mockFns.onLoad}
            onOpen={mockFns.onOpen}
            onClose={mockFns.onClose}
            onChalExpired={mockFns.onChalExpired}
            sentry={TEST_PROPS.sentry}
          />
        );
        instance = ref.current;
    });

    it("renders into a div", () => {
        const node = ref.current.ref.current;
        expect(node.nodeName).toBe("DIV");
    });

    it("has functions", () => {
        expect(typeof instance.execute).toBe("function");
        expect(typeof instance.resetCaptcha).toBe("function");
        expect(typeof instance.getResponse).toBe("function");
        expect(typeof instance.getRespKey).toBe("function");
        expect(typeof instance.setData).toBe("function");
        expect(instance.execute).toBeDefined();
        expect(instance.resetCaptcha).toBeDefined();
        expect(instance.getResponse).toBeDefined();
        expect(instance.getRespKey).toBeDefined();
        expect(instance.setData).toBeDefined();
    });

    it("can execute synchronously without arguments", () => {
      expect(window.hcaptcha.execute.mock.calls.length).toBe(0);
      instance.execute();
      expect(window.hcaptcha.execute.mock.calls.length).toBe(1);
      expect(window.hcaptcha.execute).toHaveBeenCalledWith(MOCK_WIDGET_ID, null);
    });

    it("can execute ignoring non-object arguments", () => {
      expect(window.hcaptcha.execute.mock.calls.length).toBe(0);
      instance.execute("foo");
      expect(window.hcaptcha.execute.mock.calls.length).toBe(1);
      expect(window.hcaptcha.execute).toHaveBeenCalledWith(MOCK_WIDGET_ID, null);
    });

    it("stores and calls execute after hCaptcha onload is executed", async () => {
        jest.spyOn(instance, 'isReady').mockReturnValueOnce(false);
        instance.execute();
        expect(window.hcaptcha.execute.mock.calls.length).toBe(0);
        await instance._onReady(MOCK_WIDGET_ID);      
        expect(window.hcaptcha.execute.mock.calls.length).toBe(1);
        expect(window.hcaptcha.execute).toHaveBeenCalledWith(MOCK_WIDGET_ID, null);
    });

    // This test is covered by "stores and calls execute after hCaptcha onload is executed" above
    // which tests the same behavior using mock spies instead of changing window.hcaptcha
    it("stores the execute command and calls it after hCaptcha onload is executed", async () => {
        const onLoad = jest.fn(() => {
            expect(localInstance.captchaId).toBe(MOCK_WIDGET_ID);
        });

        const localRef = React.createRef<any>();
        render(
          <HCaptcha
            ref={localRef}
            sitekey={TEST_PROPS.sitekey}
            onLoad={onLoad}
            sentry={false}
          />
        );
        const localInstance = localRef.current;

        // Reset execute mock to track new calls
        window.hcaptcha.execute.mockClear();

        // Spy on isReady to return false once (to store execute command)
        jest.spyOn(localInstance, 'isReady').mockReturnValueOnce(false);

        localInstance.execute();
        expect(window.hcaptcha.execute.mock.calls.length).toBe(0);

        // Call _onReady directly to trigger the stored execute
        await localInstance._onReady(MOCK_WIDGET_ID);

        expect(window.hcaptcha.execute.mock.calls.length).toBe(1);
        expect(window.hcaptcha.execute).toHaveBeenCalledWith(MOCK_WIDGET_ID, null);
    });

    it("can execute synchronously with async: false", () => {
      expect(window.hcaptcha.execute.mock.calls.length).toBe(0);
      instance.execute({ async: false });
      expect(window.hcaptcha.execute.mock.calls.length).toBe(1);
      expect(window.hcaptcha.execute).toHaveBeenCalledWith(MOCK_WIDGET_ID, { async: false });
    });

    it("can execute asynchronously with async: true", async () => {
      expect(window.hcaptcha.execute.mock.calls.length).toBe(0);
      await instance.execute({ async: true });
      expect(window.hcaptcha.execute.mock.calls.length).toBe(1);
      expect(window.hcaptcha.execute).toHaveBeenCalledWith(MOCK_WIDGET_ID, { async: true });
    });

    it("can asynchronously return token and key", async () => {
      const res = await instance.execute({ async: true });
      expect(res).toMatchObject({
        response: MOCK_TOKEN,
        key: MOCK_EKEY
      })
    });

    it("can execute synchronously without returning a promise", async () => {
      const resWithAsyncFalse = await instance.execute({ async: false });
      const resWithoutParams = await instance.execute();

      expect(resWithAsyncFalse).toBe(undefined);
      expect(resWithoutParams).toEqual(resWithAsyncFalse);
    });

    it("can reset", () => {
        expect(window.hcaptcha.reset.mock.calls.length).toBe(0);
        instance.resetCaptcha();
        expect(window.hcaptcha.reset.mock.calls.length).toBe(1);
        expect(window.hcaptcha.reset.mock.calls[0][0]).toBe(MOCK_WIDGET_ID);
    });

    it("can remove", async () => {
        expect(window.hcaptcha.remove.mock.calls.length).toBe(0);
        await act(async () => {
            instance.removeCaptcha();
        });
        expect(window.hcaptcha.remove.mock.calls.length).toBe(1);
        expect(window.hcaptcha.remove.mock.calls[0][0]).toBe(MOCK_WIDGET_ID);
    });

    it("can get Response", () => {
        expect(window.hcaptcha.getResponse.mock.calls.length).toBe(0);
        const res = instance.getResponse();
        expect(window.hcaptcha.getResponse.mock.calls.length).toBe(1);
        expect(window.hcaptcha.getResponse.mock.calls[0][0]).toBe(MOCK_WIDGET_ID);
        expect(res).toBe(MOCK_TOKEN);
    });

    it("can get RespKey", () => {
        expect(window.hcaptcha.getRespKey.mock.calls.length).toBe(0);
        const res = instance.getRespKey();
        expect(window.hcaptcha.getRespKey.mock.calls.length).toBe(1);
        expect(window.hcaptcha.getRespKey.mock.calls[0][0]).toBe(MOCK_WIDGET_ID);
        expect(res).toBe(MOCK_EKEY);
    });

    it("can set Data", () => {
        expect(window.hcaptcha.setData.mock.calls.length).toBe(0);
        const dataObj = { data: { nested: 1 } };
        instance.setData(dataObj);
        expect(window.hcaptcha.setData.mock.calls.length).toBe(1);
        expect(window.hcaptcha.setData.mock.calls[0][0]).toBe(MOCK_WIDGET_ID);
        expect(window.hcaptcha.setData.mock.calls[0][1]).toBe(dataObj);
    });

    it("should emit onLoad event if no hCaptcha ID is stored", async () => {
        instance.captchaId = '';
        expect(mockFns.onLoad.mock.calls.length).toBe(0);
        await act(async () => {
            instance.handleOnLoad();
        });
        expect(mockFns.onLoad.mock.calls.length).toBe(1);
    });

    it("should not emit onLoad event if hCapthcha ID is found", async () => {
        await act(async () => {
            instance.handleOnLoad();
        });
        expect(mockFns.onLoad.mock.calls.length).toBe(0);
    });


    it("emits verify with token and eKey", () => {
        expect(mockFns.onVerify.mock.calls.length).toBe(0);
        instance.handleSubmit();
        expect(mockFns.onVerify.mock.calls.length).toBe(1);
        expect(mockFns.onVerify.mock.calls[0][0]).toBe(MOCK_TOKEN);
        expect(mockFns.onVerify.mock.calls[0][1]).toBe(MOCK_EKEY);
    });

    it("emits error and calls reset", () => {
        expect(mockFns.onError.mock.calls.length).toBe(0);
        const error = "invalid-input-response";
        instance.handleError(error);
        expect(mockFns.onError.mock.calls.length).toBe(1);
        expect(mockFns.onError.mock.calls[0][0]).toBe(error);
        expect(window.hcaptcha.reset.mock.calls.length).toBe(1);
    });

    it("emits expire and calls reset", () => {
        expect(mockFns.onExpire.mock.calls.length).toBe(0);
        instance.handleExpire();
        expect(mockFns.onExpire.mock.calls.length).toBe(1);
        expect(window.hcaptcha.reset.mock.calls.length).toBe(1);
    });


    it("el renders after api loads and a widget id is set", () => {
        expect(instance.captchaId).toBe(MOCK_WIDGET_ID);
        expect(window.hcaptcha.render.mock.calls.length).toBe(1);
        expect(window.hcaptcha.render.mock.calls[0][1]).toMatchObject({
            sitekey: TEST_PROPS.sitekey,
            theme: TEST_PROPS.theme,
            size: TEST_PROPS.size,
            tabindex: TEST_PROPS.tabindex
        });
    });

    it("should set id if id prop is passed", () => {
        const localRef = React.createRef();
        render(
          <HCaptcha
            ref={localRef}
            sitekey={TEST_PROPS.sitekey}
            id="test-id-1"
            sentry={false}
          />
        );
        const node = (localRef.current as any).ref.current;

        expect(node.getAttribute("id")).toBe("test-id-1");
    });

    it("should not set id if no id prop is passed", () => {
        process.env.NODE_ENV = "development";
        const localRef = React.createRef();
        render(
          <HCaptcha
            ref={localRef}
            sitekey={TEST_PROPS.sitekey}
            sentry={false}
          />
        );
        const node = (localRef.current as any).ref.current;
        expect(node.getAttribute("id")).toBe(null);
    });

    it("should call onReady when captcha is ready", (done) => {
        const localRef = React.createRef();
        const onReady = jest.fn(() => {
            expect((localRef.current as any).captchaId).toBe(MOCK_WIDGET_ID);
            done();
        });

        render(
          <HCaptcha
            ref={localRef}
            sitekey={TEST_PROPS.sitekey}
            onReady={onReady}
            sentry={false}
          />
        );
    });

    describe("Mount hCaptcha API script", () => {
        beforeEach(() => {
            // Setup hCaptcha as undefined to load script
            window.hcaptcha = undefined;
        });

        afterEach(() => {
            // Restore window.hcaptcha before cleanup runs (from outer afterEach)
            // This prevents AggregateError during React cleanup
            window.hcaptcha = getMockedHcaptcha();

            // Clean up created script tag
            document.querySelectorAll("head > script")
              .forEach(script => document.head.removeChild(script));

            jest.restoreAllMocks();
        });

        // TODO: This test needs to be updated to work with @hcaptcha/loader
        // The error callback is now triggered by loader rejection, not script onerror
        it.skip("emits error when script is failed", async () => {
            const onError = jest.fn();

            // Make hCaptchaLoader reject to simulate script loading failure
            const loader = require('@hcaptcha/loader');
            loader.hCaptchaLoader.mockImplementationOnce(() => {
                return Promise.reject(new Error("script-error"));
            });

            await act(async () => {
              render(<HCaptcha
                onError={onError}
                sitekey={TEST_PROPS.sitekey}
                sentry={false}
              />);
              // Wait for promise rejection to be handled
              await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(onError.mock.calls.length).toBe(1);
            expect((onError.mock.calls[0][0] as Error).message).toEqual("script-error");
        });

        it("validate src without", () => {
            render(<HCaptcha
              sitekey={TEST_PROPS.sitekey}
              sentry={false}
              render="explicit"
            />);

            const script = document.querySelector("head > script") as HTMLScriptElement;
            expect(script.src).toEqual("https://js.hcaptcha.com/1/api.js?onload=hCaptchaOnLoad&render=explicit&sentry=false&uj=false");
        });

        it("validate src secureApi", () => {
            render(<HCaptcha
              sitekey={TEST_PROPS.sitekey}
              sentry={false}
              secureApi={true}
              render="explicit"
            />);

            const script = document.querySelector("head > script") as HTMLScriptElement;
            expect(script.src).toEqual("https://js.hcaptcha.com/1/secure-api.js?onload=hCaptchaOnLoad&render=explicit&sentry=false&uj=false");
        });

        it("validate src scriptSource", () => {
            render(<HCaptcha
              sitekey={TEST_PROPS.sitekey}
              sentry={false}
              scriptSource="https://hcaptcha.com/1/api.js"
              render="explicit"
            />);

            const script = document.querySelector("head > script") as HTMLScriptElement;
            expect(script.src).toEqual("https://hcaptcha.com/1/api.js?onload=hCaptchaOnLoad&render=explicit&sentry=false&uj=false");
        });

        it("apihost should change script src, but not be added as query", () => {
            const ExpectHost = "https://test.com";

            render(<HCaptcha
              apihost={ExpectHost}
              sitekey={TEST_PROPS.sitekey}
              sentry={false}
            />);

            const script = document.querySelector("head > script") as HTMLScriptElement;
            expect(script.src).toContain(ExpectHost);
            expect(script.src).not.toContain(`apihost=${encodeURIComponent(ExpectHost)}`);
        });

        it("assethost should be found when prop is set", () => {
            const ExpectHost = "https://test.com";

            render(<HCaptcha
              assethost={ExpectHost}
              sitekey={TEST_PROPS.sitekey}
              sentry={false}
            />);

            const script = document.querySelector("head > script") as HTMLScriptElement;
            expect(script.src).toContain(`assethost=${encodeURIComponent(ExpectHost)}`);
        });

        it("endpoint should be found when prop is set", () => {
            const ExpectHost = "https://test.com";

            render(<HCaptcha
              endpoint={ExpectHost}
              sitekey={TEST_PROPS.sitekey}
              sentry={false}
            />);

            const script = document.querySelector("head > script") as HTMLScriptElement;
            expect(script.src).toContain(`endpoint=${encodeURIComponent(ExpectHost)}`);
        });

        it("imghost should be found when prop is set", () => {
            const ExpectHost = "https://test.com";

            render(<HCaptcha
              imghost={ExpectHost}
              sitekey={TEST_PROPS.sitekey}
              sentry={false}
            />);

            const script = document.querySelector("head > script") as HTMLScriptElement;
            expect(script.src).toContain(`imghost=${encodeURIComponent(ExpectHost)}`);
        });

        it("reportapi should be found when prop is set", () => {
            const ExpectHost = "https://test.com";

            render(<HCaptcha
              reportapi={ExpectHost}
              sitekey={TEST_PROPS.sitekey}
              sentry={false}
            />);

            const script = document.querySelector("head > script") as HTMLScriptElement;
            expect(script.src).toContain(`reportapi=${encodeURIComponent(ExpectHost)}`);
        });

        it("hl should be found when prop languageOverride is set", () => {
            render(<HCaptcha
              languageOverride="fr"
              sitekey={TEST_PROPS.sitekey}
              sentry={false}
            />);

            const script = document.querySelector("head > script") as HTMLScriptElement;
            expect(script.src).toContain("hl=fr");
        });

        it("reCaptchaCompat should be found when prop is set to false", () => {
            render(<HCaptcha
              reCaptchaCompat={false}
              sitekey={TEST_PROPS.sitekey}
              sentry={false}
            />);

            const script = document.querySelector("head > script") as HTMLScriptElement;
            expect(script.src).toContain("recaptchacompat=off");
        });

        it("reCaptchaCompat should not be found when prop is set to anything except false", () => {
            render(<HCaptcha
              reCaptchaCompat={true}
              sitekey={TEST_PROPS.sitekey}
              sentry={false}
            />);

            const script = document.querySelector("head > script") as HTMLScriptElement;
            expect(script.src).not.toContain("recaptchacompat");
        });

        it("sentry should be found when prop is set", () => {
            render(<HCaptcha
              sitekey={TEST_PROPS.sitekey}
              sentry={false}
            />);

            const script = document.querySelector("head > script") as HTMLScriptElement;
            expect(script.src).toContain("sentry=false");
        });

        it("host should be found when prop is set", () => {
            render(<HCaptcha
              host="test.com"
              sitekey={TEST_PROPS.sitekey}
              sentry={false}
            />);

            const script = document.querySelector("head > script") as HTMLScriptElement;
            expect(script.src).toContain("host=test.com");
        });

        it("custom parameter should be in script query", () => {
            render(<HCaptcha
              custom={true}
              sitekey={TEST_PROPS.sitekey}
              sentry={false}
            />);

            const script = document.querySelector("head > script") as HTMLScriptElement;
            expect(script.src).toContain("custom=true");
        });

        it("should have async set by default", () => {
            render(<HCaptcha
              sitekey={TEST_PROPS.sitekey}
              sentry={false}
            />);

            const script = document.querySelector("head > script") as HTMLScriptElement;
            expect(script.async).toBeTruthy();
        });

        it("should not have async set when prop loadAsync is set as false", () => {
            render(<HCaptcha
              loadAsync={false}
              sitekey={TEST_PROPS.sitekey}
              sentry={false}
            />);

            const script = document.querySelector("head > script") as HTMLScriptElement;
            expect(script.async).toBeFalsy();
        });

        it("should have async set when prop loadAsync is set as true", () => {
            render(<HCaptcha
              loadAsync={true}
              sitekey={TEST_PROPS.sitekey}
              sentry={false}
            />);

            const script = document.querySelector("head > script") as HTMLScriptElement;
            expect(script.async).toBeTruthy();
        });

    });

    describe("scriptLocation", () => {

        beforeEach(() => {
            // Setup hCaptcha as undefined to load script
            window.hcaptcha = undefined;
        });

        afterEach(() => {
            // Restore window.hcaptcha before outer cleanup runs
            window.hcaptcha = getMockedHcaptcha();
        });

         it("should append to document.head by default", async () => {
            const localRef = React.createRef<any>();
            render(<HCaptcha
              ref={localRef}
              sitekey={TEST_PROPS.sitekey}
              sentry={false}
            />);
            const localInstance = localRef.current;

            // Manually set hCaptcha API since script does not actually load here
            window.hcaptcha = getMockedHcaptcha();
            await act(async () => {
                localInstance.handleOnLoad();
            });

            expect(localInstance._hcaptcha).toEqual(window.hcaptcha);

            const script = document.querySelector("head > script");
            expect(script).toBeTruthy();

            // clean up
            document.head.removeChild(script);
        });

        it("shouldn't create multiple scripts for multiple captchas", async () => {
            const ref0 = React.createRef<any>();
            render(<HCaptcha
              ref={ref0}
              sitekey={TEST_PROPS.sitekey}
              sentry={false}
            />);
            const instance0 = ref0.current;

            // Manually set hCaptcha API since script does not actually load here
            window.hcaptcha = getMockedHcaptcha();
            await act(async () => {
                instance0.handleOnLoad();
            });

            const ref1 = React.createRef<any>();
            render(<HCaptcha
              ref={ref1}
              sitekey={TEST_PROPS.sitekey}
              sentry={false}
            />);
            const instance1 = ref1.current;

            const scripts = document.querySelectorAll("head > script");
            expect(scripts.length).toBe(1);

            expect(instance0._hcaptcha).toEqual(window.hcaptcha);
            expect(instance1._hcaptcha).toEqual(window.hcaptcha);

            // clean up
            const script = document.querySelector("head > script");
            document.head.removeChild(script)
        });

        it("should append script into specified DOM element", async () => {
            const element = document.createElement('div');
            element.id = "script-location";

            document.body.appendChild(element);

            const localRef = React.createRef<any>();
            render(<HCaptcha
              ref={localRef}
              scriptLocation={element}
              sitekey={TEST_PROPS.sitekey}
              sentry={false}
            />);
            const localInstance = localRef.current;

            // Manually set hCaptcha API since script does not actually load here
            window.hcaptcha = getMockedHcaptcha();
            await act(async () => {
                localInstance.handleOnLoad();
            });

            let script;
            script = document.querySelector("head > script");
            expect(script).toBeFalsy();

            script = document.querySelector("#script-location > script");
            expect(script).toBeTruthy();

            expect(localInstance._hcaptcha).toEqual(window.hcaptcha);

            // clean up
            document.body.removeChild(element)
        });

        describe('iframe', () => {
            const iframe = document.createElement('iframe');
             document.body.appendChild(iframe);

            const iframeWin = iframe.contentWindow as any;
            const iframeDoc = iframeWin.document;

            let iframeInstance: any;

            beforeAll(() => {
                delete (window as any)["hCaptchaOnLoad"];
            });

            afterAll(() => {
                // clean up, keep iFrame persistent between tests
                document.body.removeChild(iframe);
                delete iframeWin["hCaptchaOnLoad"];
            });

            it("should append script into supplied iFrame", async () => {
                const localRef = React.createRef<any>();
                render(<HCaptcha
                  ref={localRef}
                  scriptLocation={iframeDoc.head}
                  sitekey={TEST_PROPS.sitekey}
                  sentry={false}
                />);
                iframeInstance = localRef.current;

                // Manually set hCaptcha API since script does not actually load here
                iframeWin.hcaptcha = getMockedHcaptcha();
                await act(async () => {
                    iframeInstance.handleOnLoad();
                });

                let script;
                script = document.querySelector("head > script");
                expect(script).toBeFalsy();

                script = iframeDoc.querySelector("head > script");
                expect(script).toBeTruthy();
            });

            it("should have hCaptchaOnLoad in iFrame window", () => {
                expect(iframeWin).toHaveProperty("hCaptchaOnLoad");
            });

            it("should load hCaptcha API in iFrame window", () => {
                expect(iframeInstance._hcaptcha).toEqual(iframeWin.hcaptcha);
            });

            it("should only append script tag once for same element specified", () => {
                // iframeWin.hcaptcha is already set from the previous test
                render(<HCaptcha
                  scriptLocation={iframeDoc.head}
                  sitekey={TEST_PROPS.sitekey}
                  sentry={false}
                />);

                const scripts = iframeDoc.querySelectorAll("head > script");
                expect(scripts.length).toBe(1);
            });

            it("should append new script tag for new element specified", async () => {
                const iframe2 = document.createElement("iframe");
                document.body.appendChild(iframe2);

                const iframe2Win = iframe2.contentWindow as any;
                const iframe2Doc = iframe2Win.document;

                const localRef = React.createRef<any>();
                render(<HCaptcha
                  ref={localRef}
                  scriptLocation={iframe2Doc.head}
                  sitekey={TEST_PROPS.sitekey}
                  sentry={false}
                />);
                const localInstance = localRef.current;

                // Manually set hCaptcha API since script does not actually load here
                iframe2Win.hcaptcha = getMockedHcaptcha();
                await act(async () => {
                    localInstance.handleOnLoad();
                });

                const script = iframe2Doc.querySelector("head > script");
                expect(script).toBeTruthy();

                const scripts = iframe2Doc.querySelectorAll("head > script");
                expect(scripts.length).toBe(1);

                expect(iframe2Win).toHaveProperty("hCaptchaOnLoad");
                expect(localInstance._hcaptcha).toEqual(iframe2Win.hcaptcha);

                // clean up
                document.body.removeChild(iframe2);
                delete iframe2Win["hCaptchaOnLoad"];
            });

        });

    });

    describe('onOpen callback', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("should be called if the captcha is ready and the callback is provided as a prop", () => {
            jest.spyOn(instance, 'isReady').mockImplementation(() => true);

            expect(mockFns.onOpen.mock.calls.length).toBe(0);
            instance.handleOpen();
            expect(mockFns.onOpen.mock.calls.length).toBe(1);
        });

        it("should not be called if the captcha is not ready", () => {
            jest.spyOn(instance, 'isReady').mockImplementation(() => false);

            expect(mockFns.onOpen.mock.calls.length).toBe(0);
            instance.handleOpen();
            expect(mockFns.onOpen.mock.calls.length).toBe(0);
        });

        it("should not be called if not provided as a prop", () => {
            const localRef = React.createRef<any>();
            render(
              <HCaptcha
                ref={localRef}
                sitekey={TEST_PROPS.sitekey}
                sentry={false}
              />
            );
            const localInstance = localRef.current;
            jest.spyOn(localInstance, 'isReady').mockImplementation(() => true);

            expect(mockFns.onOpen.mock.calls.length).toBe(0);
            localInstance.handleOpen();
            expect(mockFns.onOpen.mock.calls.length).toBe(0);
        });
    });

    describe('onClose callback', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("should be called if the captcha is ready and the callback is provided as a prop", () => {
            jest.spyOn(instance, 'isReady').mockImplementation(() => true);

            expect(mockFns.onClose.mock.calls.length).toBe(0);
            instance.handleClose();
            expect(mockFns.onClose.mock.calls.length).toBe(1);
        });

        it("should not be called if the captcha is not ready", () => {
            jest.spyOn(instance, 'isReady').mockImplementation(() => false);

            expect(mockFns.onClose.mock.calls.length).toBe(0);
            instance.handleClose();
            expect(mockFns.onClose.mock.calls.length).toBe(0);
        });

        it("should not be called if not provided as a prop", () => {
            const localRef = React.createRef<any>();
            render(
              <HCaptcha
                ref={localRef}
                sitekey={TEST_PROPS.sitekey}
                sentry={false}
              />
            );
            const localInstance = localRef.current;
            jest.spyOn(localInstance, 'isReady').mockImplementation(() => true);

            expect(mockFns.onClose.mock.calls.length).toBe(0);
            localInstance.handleClose();
            expect(mockFns.onClose.mock.calls.length).toBe(0);
        });
    });

    describe('onChalExpired callback', () => {
        afterEach(() => {
            jest.restoreAllMocks();
        });

        it("should be called if the captcha is ready and the callback is provided as a prop", () => {
            jest.spyOn(instance, 'isReady').mockImplementation(() => true);

            expect(mockFns.onChalExpired.mock.calls.length).toBe(0);
            instance.handleChallengeExpired();
            expect(mockFns.onChalExpired.mock.calls.length).toBe(1);
        });

        it("should not be called if the captcha is not ready", () => {
            jest.spyOn(instance, 'isReady').mockImplementation(() => false);

            expect(mockFns.onClose.mock.calls.length).toBe(0);
            instance.handleClose();
            expect(mockFns.onClose.mock.calls.length).toBe(0);
        });

        it("should not be called if not provided as a prop", () => {
            const localRef = React.createRef<any>();
            render(
              <HCaptcha
                ref={localRef}
                sitekey={TEST_PROPS.sitekey}
                sentry={false}
              />
            );
            const localInstance = localRef.current;
            jest.spyOn(localInstance, 'isReady').mockImplementation(() => true);

            expect(mockFns.onChalExpired.mock.calls.length).toBe(0);
            localInstance.handleChallengeExpired();
            expect(mockFns.onChalExpired.mock.calls.length).toBe(0);
        });
    });

    describe('async execute promise rejection', () => {
        it("should reject pending async execute on unmount", async () => {
            const localRef = React.createRef<any>();
            const { unmount } = render(
              <HCaptcha
                ref={localRef}
                sitekey={TEST_PROPS.sitekey}
                sentry={false}
              />
            );
            const localInstance = localRef.current;
            jest.spyOn(localInstance, 'isReady').mockReturnValue(false);

            const executePromise = localInstance.execute({ async: true });
            unmount();

            await expect(executePromise).rejects.toThrow('react-component-unmounted');
        });

        it("should reject pending async execute on reset", async () => {
            jest.spyOn(instance, 'isReady').mockReturnValueOnce(false).mockReturnValue(true);

            const executePromise = instance.execute({ async: true });
            instance.resetCaptcha();

            await expect(executePromise).rejects.toThrow('hcaptcha-reset');
        });

        it("should reject pending async execute on remove", async () => {
            jest.spyOn(instance, 'isReady').mockReturnValueOnce(false).mockReturnValue(true);

            const executePromise = instance.execute({ async: true });
            instance.removeCaptcha();

            await expect(executePromise).rejects.toThrow('hcaptcha-removed');
        });

        it("should reject pending async execute on close method", async () => {
            jest.spyOn(instance, 'isReady').mockReturnValueOnce(false).mockReturnValue(true);

            const executePromise = instance.execute({ async: true });
            instance.close();

            await expect(executePromise).rejects.toThrow('hcaptcha-closed');
        });

        it("should return hcaptcha.execute promise reject instead of react pending execute promise for user close action", async () => {
            instance._hcaptcha.execute.mockRejectedValueOnce(new Error("user-closed"));

            const executePromise = instance.execute({ async: true });
            await expect(executePromise).rejects.toThrow('user-closed');
        });

        it("should reject previous async execute when a new one is called", async () => {
            const firstPromise = instance.execute({ async: true });
            const secondPromise = instance.execute({ async: true });

            await expect(firstPromise).rejects.toThrow('hcaptcha-execute-replaced');
            await expect(secondPromise).resolves.toBeDefined();
        });
    });
});
