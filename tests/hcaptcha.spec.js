import React, { useRef } from "react";
import ReactDOM from "react-dom";
import ReactTestUtils, { act } from "react-dom/test-utils";

import { describe, jest, it } from "@jest/globals";

import {getMockedHcaptcha, MOCK_EKEY, MOCK_TOKEN, MOCK_WIDGET_ID} from "./hcaptcha.mock";

let HCaptcha;

const TEST_PROPS = {
    sitekey: "10000000-ffff-ffff-ffff-000000000001",
    theme: "light",
    size: "invisible",
    tabindex: 0,
    sentry: false,
};

describe("hCaptcha", () => {
    let instance;
    let mockFns;

    beforeEach(() => {
        jest.isolateModules(() => {
            // Use node's `require` because `jest.isolateModules` cannot be async to use it with `await import()`
            HCaptcha = require('../src/index');
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
        instance = ReactTestUtils.renderIntoDocument(
            <HCaptcha
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
            />,
        );
    });

    it("renders into a div", () => {
        expect(ReactDOM.findDOMNode(instance).nodeName).toBe("DIV");
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
      expect(window.hcaptcha.execute).toBeCalledWith(MOCK_WIDGET_ID, null);
    });

    it("can execute ignoring non-object arguments", () => {
      expect(window.hcaptcha.execute.mock.calls.length).toBe(0);
      instance.execute("foo");
      expect(window.hcaptcha.execute.mock.calls.length).toBe(1);
      expect(window.hcaptcha.execute).toBeCalledWith(MOCK_WIDGET_ID, null);
    });

    it("can execute synchronously with async: false", () => {
      expect(window.hcaptcha.execute.mock.calls.length).toBe(0);
      instance.execute({ async: false });
      expect(window.hcaptcha.execute.mock.calls.length).toBe(1);
      expect(window.hcaptcha.execute).toBeCalledWith(MOCK_WIDGET_ID, { async: false });
    });

    it("can execute asynchronously with async: true", async () => {
      expect(window.hcaptcha.execute.mock.calls.length).toBe(0);
      await instance.execute({ async: true });
      expect(window.hcaptcha.execute.mock.calls.length).toBe(1);
      expect(window.hcaptcha.execute).toBeCalledWith(MOCK_WIDGET_ID, { async: true });
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

    it("can remove", () => {
        expect(window.hcaptcha.remove.mock.calls.length).toBe(0);
        instance.removeCaptcha();
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

    it("emits onLoad event", () => {
        expect(mockFns.onLoad.mock.calls.length).toBe(0);
        instance.handleOnLoad();
        expect(mockFns.onLoad.mock.calls.length).toBe(1);
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

    describe('onOpen callback', () => {
        afterAll(() => {
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
            instance = ReactTestUtils.renderIntoDocument(
                <HCaptcha
                    sitekey={TEST_PROPS.sitekey}
                    sentry={false}
                />,
            );
            jest.spyOn(instance, 'isReady').mockImplementation(() => true);

            expect(mockFns.onOpen.mock.calls.length).toBe(0);
            instance.handleOpen();
            expect(mockFns.onOpen.mock.calls.length).toBe(0);
        });
    });

    describe('onClose callback', () => {
        afterAll(() => {
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
            instance = ReactTestUtils.renderIntoDocument(
                <HCaptcha
                    sitekey={TEST_PROPS.sitekey}
                    sentry={false}
                />,
            );
            jest.spyOn(instance, 'isReady').mockImplementation(() => true);

            expect(mockFns.onClose.mock.calls.length).toBe(0);
            instance.handleClose();
            expect(mockFns.onClose.mock.calls.length).toBe(0);
        });
    });

    describe('onChalExpired callback', () => {
        afterAll(() => {
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
            instance = ReactTestUtils.renderIntoDocument(
                <HCaptcha
                    sitekey={TEST_PROPS.sitekey}
                    sentry={false}
                />,
            );
            jest.spyOn(instance, 'isReady').mockImplementation(() => true);

            expect(mockFns.onChalExpired.mock.calls.length).toBe(0);
            instance.handleChallengeExpired();
            expect(mockFns.onChalExpired.mock.calls.length).toBe(0);
        });
    });

    it("el renders after api loads and a widget id is set", () => {
        expect(instance.state.captchaId).toBe(MOCK_WIDGET_ID);
        expect(window.hcaptcha.render.mock.calls.length).toBe(1);
        expect(window.hcaptcha.render.mock.calls[0][1]).toMatchObject({
            sitekey: TEST_PROPS.sitekey,
            theme: TEST_PROPS.theme,
            size: TEST_PROPS.size,
            tabindex: TEST_PROPS.tabindex
        });
    });

    it("should set id if id prop is passed", () => {
        instance = ReactTestUtils.renderIntoDocument(
            <HCaptcha
                sitekey={TEST_PROPS.sitekey}
                id="test-id-1"
                sentry={false}
            />,
        );
        const node = ReactDOM.findDOMNode(instance);
        expect(node.getAttribute("id")).toBe("test-id-1");
    });

    it("should not set id if no id prop is passed", () => {
        process.env.NODE_ENV = "development";
        instance = ReactTestUtils.renderIntoDocument(
            <HCaptcha
                sitekey={TEST_PROPS.sitekey}
                sentry={false}
            />,
        );
        const node = ReactDOM.findDOMNode(instance);
        expect(node.getAttribute("id")).toBe(null);
    });

    it("should not set id if no id prop is passed", (done) => {

        const onLoad = jest.fn(() => {
            expect(instance.state.captchaId).toBe(MOCK_WIDGET_ID);
            done();
        });

        instance = ReactTestUtils.renderIntoDocument(
            <HCaptcha
                sitekey={TEST_PROPS.sitekey}
                onLoad={onLoad}
                sentry={false}
            />,
        );

        instance.handleOnLoad();
    });


    describe("Mount hCaptcha API script", () => {

        beforeEach(() => {
            // Setup hCaptcha as undefined to load script
            window.hcaptcha = undefined;
        });

        afterEach(() => {
            // Clean up created script tag
            document.querySelectorAll("head > script")
              .forEach(script => document.head.removeChild(script));
        });

        it("validate src without", () => {
            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    sitekey={TEST_PROPS.sitekey}
                    sentry={false}
                    render="explicit"
            />);

            const script = document.querySelector("head > script");
            expect(script.src).toEqual("https://js.hcaptcha.com/1/api.js?onload=hCaptchaOnLoad&render=explicit&sentry=false");
        });

        it("apihost should change script src, but not be added as query", () => {
            const ExpectHost = "https://test.com";

            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    apihost={ExpectHost}
                    sitekey={TEST_PROPS.sitekey}
                    sentry={false}
            />);

            const script = document.querySelector("head > script");
            expect(script.src).toContain(ExpectHost);
            expect(script.src).not.toContain(`apihost=${encodeURIComponent(ExpectHost)}`);
        });

        it("assethost should be found when prop is set", () => {
            const ExpectHost = "https://test.com";

            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    assethost={ExpectHost}
                    sitekey={TEST_PROPS.sitekey}
                    sentry={false}
            />);

            const script = document.querySelector("head > script");
            expect(script.src).toContain(`assethost=${encodeURIComponent(ExpectHost)}`);
        });

        it("endpoint should be found when prop is set", () => {
            const ExpectHost = "https://test.com";

            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    endpoint={ExpectHost}
                    sitekey={TEST_PROPS.sitekey}
                    sentry={false}
            />);

            const script = document.querySelector("head > script");
            expect(script.src).toContain(`endpoint=${encodeURIComponent(ExpectHost)}`);
        });

        it("imghost should be found when prop is set", () => {
            const ExpectHost = "https://test.com";

            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    imghost={ExpectHost}
                    sitekey={TEST_PROPS.sitekey}
                    sentry={false}
            />);

            const script = document.querySelector("head > script");
            expect(script.src).toContain(`imghost=${encodeURIComponent(ExpectHost)}`);
        });

        it("reportapi should be found when prop is set", () => {
            const ExpectHost = "https://test.com";

            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    reportapi={ExpectHost}
                    sitekey={TEST_PROPS.sitekey}
                    sentry={false}
            />);

            const script = document.querySelector("head > script");
            expect(script.src).toContain(`reportapi=${encodeURIComponent(ExpectHost)}`);
        });

        it("hl should be found when prop languageOverride is set", () => {
            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    languageOverride="fr"
                    sitekey={TEST_PROPS.sitekey}
                    sentry={false}
            />);

            const script = document.querySelector("head > script");
            expect(script.src).toContain("hl=fr");
        });

        it("reCaptchaCompat should be found when prop is set to false", () => {
            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    reCaptchaCompat={false}
                    sitekey={TEST_PROPS.sitekey}
                    sentry={false}
                />);

            const script = document.querySelector("head > script");
            expect(script.src).toContain("recaptchacompat=off");
        });

        it("reCaptchaCompat should not be found when prop is set to anything except false", () => {
            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    reCaptchaCompat={true}
                    sitekey={TEST_PROPS.sitekey}
                    sentry={false}
            />);

            const script = document.querySelector("head > script");
            expect(script.src).not.toContain("recaptchacompat");
        });

        it("sentry should be found when prop is set", () => {
            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    sitekey={TEST_PROPS.sitekey}
                    sentry={false}
            />);

            const script = document.querySelector("head > script");
            expect(script.src).toContain("sentry=false");
        });

        it("host should be found when prop is set", () => {
            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    host="test.com"
                    sitekey={TEST_PROPS.sitekey}
                    sentry={false}
            />);

            const script = document.querySelector("head > script");
            expect(script.src).toContain("host=test.com");
        });

        it("custom parameter should be in script query", () => {
            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    custom={true}
                    sitekey={TEST_PROPS.sitekey}
                    sentry={false}
            />);

            const script = document.querySelector("head > script");
            expect(script.src).toContain("custom=true");
        });

        it("emits error when script is failed", async () => {
            const onError = jest.fn();

            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    onError={onError}
                    sitekey={TEST_PROPS.sitekey}
                    sentry={false}
                />);

            const script = document.querySelector("head > script");
            expect(onError.mock.calls.length).toBe(0);

            script.onerror(new Error('loading failed'));

            // simulate microtask
            await Promise.reject().catch(() => null)

            expect(onError.mock.calls.length).toBe(1);
            expect(onError.mock.calls[0][0].message).toEqual("script-error");
        });

        it("should have async set by default", () => {
            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    sitekey={TEST_PROPS.sitekey}
                    sentry={false}
            />);

            const script = document.querySelector("head > script");
            expect(script.async).toBeTruthy();
        });

        it("should not have async set when prop loadAsync is set as false", () => {
            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    loadAsync={false}
                    sitekey={TEST_PROPS.sitekey}
                    sentry={false}
            />);

            const script = document.querySelector("head > script");
            expect(script.async).toBeFalsy();
        });

        it("should have async set when prop loadAsync is set as true", () => {
            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    loadAsync={true}
                    sitekey={TEST_PROPS.sitekey}
                    sentry={false}
            />);

            const script = document.querySelector("head > script");
            expect(script.async).toBeTruthy();
        });

    });

    describe("scriptLocation", () => {

        beforeEach(() => {
            // Setup hCaptcha as undefined to load script
            window.hcaptcha = undefined;
        });

         it("should append to document.head by default", () => {
            const instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    sitekey={TEST_PROPS.sitekey}
                    sentry={false}
            />);

            // Manually set hCaptcha API since script does not actually load here
            window.hcaptcha = getMockedHcaptcha();
            instance.handleOnLoad();

            expect(instance._hcaptcha).toEqual(window.hcaptcha);

            const script = document.querySelector("head > script");
            expect(script).toBeTruthy();

            // clean up
            document.head.removeChild(script);
        });

        it("shouldn't create multiple scripts for multiple captchas", () => {
            const instance0 = ReactTestUtils.renderIntoDocument(<HCaptcha
                sitekey={TEST_PROPS.sitekey}
                sentry={false}
            />);

            // Manually set hCaptcha API since script does not actually load here
            window.hcaptcha = getMockedHcaptcha();
            instance0.handleOnLoad();

            const instance1 = ReactTestUtils.renderIntoDocument(<HCaptcha
                sitekey={TEST_PROPS.sitekey}
                sentry={false}
            />);

            const scripts = document.querySelectorAll("head > script");
            expect(scripts.length).toBe(1);

            expect(instance0._hcaptcha).toEqual(window.hcaptcha);
            expect(instance1._hcaptcha).toEqual(window.hcaptcha);

            // clean up
            const script = document.querySelector("head > script");
            document.head.removeChild(script)
        });

        it("should append script into specified DOM element", () => {
            const element = document.createElement('div');
            element.id = "script-location";

            document.body.appendChild(element);

            const instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    scriptLocation={element}
                    sitekey={TEST_PROPS.sitekey}
                    sentry={false}
            />);

            // Manually set hCaptcha API since script does not actually load here
            window.hcaptcha = getMockedHcaptcha();
            instance.handleOnLoad();

            let script;
            script = document.querySelector("head > script");
            expect(script).toBeFalsy();

            script = document.querySelector("#script-location > script");
            expect(script).toBeTruthy();

            expect(instance._hcaptcha).toEqual(window.hcaptcha);

            // clean up
            document.body.removeChild(element)
        });

        describe('iframe', () => {
            const iframe = document.createElement('iframe');
             document.body.appendChild(iframe);

            const iframeWin = iframe.contentWindow;
            const iframeDoc = iframeWin.document;

            let instance;

            beforeAll(() => {
                delete window["hCaptchaOnLoad"];
            });

            afterAll(() => {
                // clean up, keep iFrame persistent between tests
                document.body.removeChild(iframe);
                delete iframeWin["hCaptchaOnLoad"];
            });

            it("should append script into supplied iFrame", () => {
                instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                        scriptLocation={iframeDoc.head}
                        sitekey={TEST_PROPS.sitekey}
                        sentry={false}
                />);

                // Manually set hCaptcha API since script does not actually load here
                iframeWin.hcaptcha = getMockedHcaptcha();
                instance.handleOnLoad();

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
                expect(instance._hcaptcha).toEqual(iframeWin.hcaptcha);
            });

            it("should only append script tag once for same element specified", () => {
                ReactTestUtils.renderIntoDocument(<HCaptcha
                    scriptLocation={iframeDoc.head}
                    sitekey={TEST_PROPS.sitekey}
                    sentry={false}
                />);

                const scripts = iframeDoc.querySelectorAll("head > script");
                expect(scripts.length).toBe(1);
            });

            it("should append new script tag for new element specified", () => {
                const iframe2 = document.createElement("iframe");
                document.body.appendChild(iframe2);

                const iframe2Win = iframe.contentWindow;
                const iframe2Doc = iframe2Win.document;

                const instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    scriptLocation={iframe2Doc.head}
                    sitekey={TEST_PROPS.sitekey}
                    sentry={false}
                />);

                // Manually set hCaptcha API since script does not actually load here
                iframe2Win.hcaptcha = getMockedHcaptcha();
                instance.handleOnLoad();

                const script = iframe2Doc.querySelector("head > script");
                expect(script).toBeTruthy();

                const scripts = iframe2Doc.querySelectorAll("head > script");
                expect(scripts.length).toBe(1);

                expect(iframe2Win).toHaveProperty("hCaptchaOnLoad");
                expect(instance._hcaptcha).toEqual(iframe2Win.hcaptcha);

                // clean up
                document.body.removeChild(iframe2);
                delete iframe2Win["hCaptchaOnLoad"];
            });

        });

    });
});
