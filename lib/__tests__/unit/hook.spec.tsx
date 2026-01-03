import { describe, jest, it, expect, afterEach } from "@jest/globals";
import { act, renderHook } from '@testing-library/react';

import HCaptcha from '../../src/index.js';

import { getMockedHcaptcha, MOCK_TOKEN } from "../__mocks__/hcaptcha.mock.js";
import { HCaptchaProvider, useHCaptcha } from "../../src/hook/index.jsx";

const TEST_SITEKEY = "10000000-ffff-ffff-ffff-000000000001";

jest.mock('../../src/index.js');

describe('useHCaptcha', () => {

  const createProvider = (Provider, props) => {
    return function CreatedProvider({ children }) {
      return <Provider {...props}>{children}</Provider>;
    };
  };

  afterEach(() => {
    window.hcaptcha = null;
  });

  it('should return default values upon empty initialization', () => {
    const { result, rerender } = renderHook(
      () => useHCaptcha(), {
        wrapper:createProvider(HCaptchaProvider)
      }
    );

    const context = result.current;
    expect(context.token).toBeNull();
    expect(context.error).toBeNull();
    expect(context.sitekey).toBeNull();
    expect(context.ready).toBeFalsy();
    expect(typeof context.executeInstance).toBe("function");
    expect(typeof context.resetInstance).toBe("function");
  });

  it('should return sitekey when added to provider', () => {
    const { result, rerender } = renderHook(
      () => useHCaptcha(), {
        wrapper:createProvider(HCaptchaProvider, { sitekey:TEST_SITEKEY })
      }
    );

    const context = result.current;
    expect(context.sitekey).toEqual(TEST_SITEKEY);
  });

  it('should return site ready when hCaptcha api is available', () => {
    window.hcaptcha = getMockedHcaptcha();

    const { result, rerender } = renderHook(
      () => useHCaptcha(), {
        wrapper:createProvider(HCaptchaProvider, { sitekey:TEST_SITEKEY })
      }
    );

    const context = result.current;
    expect(context.ready).toBeTruthy();
  });

  it("should call onVerify when user passes hCaptcha", async () => {

    const { result, rerender } = renderHook(
      () => useHCaptcha(), {
        wrapper:createProvider(HCaptchaProvider, { sitekey:TEST_SITEKEY })
      }
    );

    const context = result.current;
    await act(async () => {
      console.log('ececut');
      await context.executeInstance();
    });

    console.log(HCaptcha.mock)

    expect(context.token).toBe(MOCK_TOKEN);

  });

});