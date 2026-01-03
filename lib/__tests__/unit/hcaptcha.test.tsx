import React, { useRef } from "react";

import { describe, jest, it, afterEach, beforeAll, beforeEach } from "@jest/globals";
import { act, render } from '@testing-library/react';
import waitForExpect from "wait-for-expect";

import { hCaptchaLoader } from '@hcaptcha/loader';

import { getMockedHcaptcha, MOCK_EKEY, MOCK_TOKEN, MOCK_WIDGET_ID } from "../__mocks__/hcaptcha.mock.js";

import { HCaptcha } from '../../src/index.js';

jest.mock('@hcaptcha/loader');

// const { hCaptchaLoader } = await import('@hcaptcha/loader');

describe('<HCaptcha />', () => {

  afterEach(() => {
    window.hcaptcha = null;
  });

  it('should return instance with exposed functions when supplying ref property', () => {

    const ref = React.createRef();
    render(<HCaptcha ref={ref}/>);

    const instance = ref.current;

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

  describe("#execute", () => {

    beforeEach(() => {
     // window.hcaptcha = getMockedHcaptcha();
    });

    it("should run synchronously without arguments", () => {
       window.hcaptcha = getMockedHcaptcha();

      const ref = React.createRef();
      render(<HCaptcha ref={ref}/>);
      const instance = ref.current;

      expect(window.hcaptcha.execute.mock.calls.length).toBe(0);

      instance.execute();

      expect(window.hcaptcha.execute.mock.calls.length).toBe(1);
      expect(window.hcaptcha.execute).toBeCalledWith(MOCK_WIDGET_ID, null);
    });


    it("should ignoring any values that do not comply with schema", () => {
      window.hcaptcha = getMockedHcaptcha();

      const ref = React.createRef();
      render(<HCaptcha ref={ref}/>);
      const instance = ref.current;


      expect(window.hcaptcha.execute.mock.calls.length).toBe(0);

      instance.execute("foo");

      expect(window.hcaptcha.execute.mock.calls.length).toBe(1);
      expect(window.hcaptcha.execute).toBeCalledWith(MOCK_WIDGET_ID, null);
    });

    it.only("should run once hCaptcha onReady is called", async () => {
        const ref = React.createRef();
        render(<HCaptcha ref={ref}/>);
        const instance = ref.current;

        // HCaptcha
        console.log(hCaptchaLoader);

        // jest.spyOn(instance, 'isReady').mockReturnValueOnce(false);


         // window.hcaptcha = getMockedHcaptcha();

        instance.execute();

        expect(window.hcaptcha.execute.mock.calls.length).toBe(0);

        // await instance._onReady(MOCK_WIDGET_ID);

        // expect(window.hcaptcha.execute.mock.calls.length).toBe(1);
        expect(window.hcaptcha.execute).toBeCalledWith(MOCK_WIDGET_ID, null);
    });

    // it("stores the execute command and calls it after hCaptcha onload is executed", async () => {

    //     const onload = jest.fn();

    //     const ref = React.createRef();
    //     render(<HCaptcha ref={ref} onLoad={onload}/>);
    //     const instance = ref.current;

    //      window.hcaptcha = getMockedHcaptcha();

    //     expect(onload).toHaveBeenCalled();

    //     expect(window.hcaptcha.execute.mock.calls.length).toBe(1);
    //     expect(window.hcaptcha.execute).toBeCalledWith(MOCK_WIDGET_ID, null);
    // });

    // it("can execute synchronously with async: false", () => {
    //   expect(window.hcaptcha.execute.mock.calls.length).toBe(0);
    //   instance.execute({ async: false });
    //   expect(window.hcaptcha.execute.mock.calls.length).toBe(1);
    //   expect(window.hcaptcha.execute).toBeCalledWith(MOCK_WIDGET_ID, { async: false });
    // });

    // it("can execute asynchronously with async: true", async () => {
    //   expect(window.hcaptcha.execute.mock.calls.length).toBe(0);
    //   await instance.execute({ async: true });
    //   expect(window.hcaptcha.execute.mock.calls.length).toBe(1);
    //   expect(window.hcaptcha.execute).toBeCalledWith(MOCK_WIDGET_ID, { async: true });
    // });

    // it("can asynchronously return token and key", async () => {
    //   const res = await instance.execute({ async: true });
    //   expect(res).toMatchObject({
    //     response: MOCK_TOKEN,
    //     key: MOCK_EKEY
    //   })
    // });

    // it("can execute synchronously without returning a promise", async () => {
    //   const resWithAsyncFalse = await instance.execute({ async: false });
    //   const resWithoutParams = await instance.execute();

    //   expect(resWithAsyncFalse).toBe(undefined);
    //   expect(resWithoutParams).toEqual(resWithAsyncFalse);
    // });
  });

});