import React from "react";
import ReactDOM from "react-dom";
import ReactTestUtils, { act } from "react-dom/test-utils";
import {getMockedHcaptcha, MOCK_EKEY, MOCK_TOKEN, MOCK_WIDGET_ID} from "./hcaptcha.mock";

let HCaptcha;

const TEST_PROPS = {
    sitekey: "10000000-ffff-ffff-ffff-000000000001",
    theme: "light",
    size: "invisible",
    tabindex: 0,
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
            />,
        );
    });

    it("renders into a div", () => {
        expect(ReactDOM.findDOMNode(instance).nodeName).toBe("DIV");
    });

    it("has functions", () => {
        expect(typeof instance.execute).toBe("function");
        expect(typeof instance.resetCaptcha).toBe("function");
        expect(instance.execute).toBeDefined();
        expect(instance.resetCaptcha).toBeDefined();
    });

    it("can execute synchronously without arguments", () => {
      expect(window.hcaptcha.execute.mock.calls.length).toBe(0);
      instance.execute();
      expect(window.hcaptcha.execute.mock.calls.length).toBe(1);
      expect(window.hcaptcha.execute).toBeCalledWith(MOCK_WIDGET_ID);
    });

    it("can execute synchronously with async: false", () => {
      expect(window.hcaptcha.execute.mock.calls.length).toBe(0);
      instance.execute({ async: false });
      expect(window.hcaptcha.execute.mock.calls.length).toBe(1);
      expect(window.hcaptcha.execute).toBeCalledWith(MOCK_WIDGET_ID);
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
            />,
        );
        const node = ReactDOM.findDOMNode(instance);
        expect(node.getAttribute("id")).toBe(null);
    });

    describe("Query parameter", () => {

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
                />);

            const script = document.querySelector("head > script");
            expect(script.src).toEqual("https://hcaptcha.com/1/api.js?render=explicit&onload=hcaptchaOnLoad");
        });

        it("apihost should change script src, but not be added as query", () => {
            const ExpectHost = "https://test.com";

            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    apihost={ExpectHost}
                    sitekey={TEST_PROPS.sitekey}
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
                />);

            const script = document.querySelector("head > script");
            expect(script.src).toContain(`assethost=${encodeURIComponent(ExpectHost)}`);
        });

        it("endpoint should be found when prop is set", () => {
            const ExpectHost = "https://test.com";

            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    endpoint={ExpectHost}
                    sitekey={TEST_PROPS.sitekey}
                />);

            const script = document.querySelector("head > script");
            expect(script.src).toContain(`endpoint=${encodeURIComponent(ExpectHost)}`);
        });

        it("imghost should be found when prop is set", () => {
            const ExpectHost = "https://test.com";

            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    imghost={ExpectHost}
                    sitekey={TEST_PROPS.sitekey}
                />);

            const script = document.querySelector("head > script");
            expect(script.src).toContain(`imghost=${encodeURIComponent(ExpectHost)}`);
        });

        it("reportapi should be found when prop is set", () => {
            const ExpectHost = "https://test.com";

            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    reportapi={ExpectHost}
                    sitekey={TEST_PROPS.sitekey}
                />);

            const script = document.querySelector("head > script");
            expect(script.src).toContain(`reportapi=${encodeURIComponent(ExpectHost)}`);
        });

        it("hl should be found when prop languageOverride is set", () => {
            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    languageOverride="fr"
                    sitekey={TEST_PROPS.sitekey}
                />);

            const script = document.querySelector("head > script");
            expect(script.src).toContain("hl=fr");
        });

        it("reCaptchaCompat should be found when prop is set to false", () => {
            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    reCaptchaCompat={false}
                    sitekey={TEST_PROPS.sitekey}
                />);

            const script = document.querySelector("head > script");
            expect(script.src).toContain("recaptchacompat=off");
        });

        it("reCaptchaCompat should not be found when prop is set to anything except false", () => {
            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    reCaptchaCompat={true}
                    sitekey={TEST_PROPS.sitekey}
                />);

            const script = document.querySelector("head > script");
            expect(script.src).not.toContain("recaptchacompat");
        });

        it("sentry should be found when prop is set", () => {
            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    sentry={true}
                    sitekey={TEST_PROPS.sitekey}
                />);

            const script = document.querySelector("head > script");
            expect(script.src).toContain("sentry=true");
        });

        it("host should be found when prop is set", () => {
            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    host="test.com"
                    sitekey={TEST_PROPS.sitekey}
                />);

            const script = document.querySelector("head > script");
            expect(script.src).toContain("host=test.com");
        });

        it("shouldn't create multiple scripts for multiple captchas", () => {
            ReactTestUtils.renderIntoDocument(<HCaptcha
                sitekey={TEST_PROPS.sitekey}
            />);
            ReactTestUtils.renderIntoDocument(<HCaptcha
                sitekey={TEST_PROPS.sitekey}
            />);

            const scripts = document.querySelectorAll("head > script");

            expect(scripts.length).toBe(1);
        });

        it("custom parameter should be in script query", () => {
            instance = ReactTestUtils.renderIntoDocument(<HCaptcha
                    custom={true}
                    sitekey={TEST_PROPS.sitekey}
                />);

            const script = document.querySelector("head > script");
            expect(script.src).toContain("custom=true");
        });
    });
});
