import React from 'react';
import { describe, jest, it, expect, afterEach, beforeEach } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';

import { getMockedHcaptcha, MOCK_TOKEN } from '../__mocks__/hcaptcha.mock.js';
import { HCaptchaProvider, useHCaptcha } from '../../src/hook/index.js';

const TEST_SITEKEY = '10000000-ffff-ffff-ffff-000000000001';

jest.mock('@hcaptcha/loader', () => ({
    hCaptchaLoader: jest.fn(() => Promise.resolve())
}));

describe('useHCaptcha', () => {
  const createProvider = (Provider, props?) => {
    return function CreatedProvider({ children }) {
      return <Provider {...props}>{children}</Provider>;
    };
  };

  beforeEach(() => {
    (window as any).hcaptcha = getMockedHcaptcha();
  });

  afterEach(() => {
    (window as any).hcaptcha = null;
  });

  it('should return default values upon empty initialization', () => {
    // Clear hcaptcha to test empty initialization
    (window as any).hcaptcha = null;

    const { result } = renderHook(
      () => useHCaptcha(), {
        wrapper: createProvider(HCaptchaProvider),
      }
    );

    const context = result.current as any;

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
        wrapper: createProvider(HCaptchaProvider, { sitekey:TEST_SITEKEY })
      }
    );

    const context = result.current as any;
    expect(context.sitekey).toEqual(TEST_SITEKEY);
  });

  it('should return site ready when hCaptcha api is available', () => {
    window.hcaptcha = getMockedHcaptcha();

    const { result, rerender } = renderHook(
      () => useHCaptcha(), {
        wrapper: createProvider(HCaptchaProvider, { sitekey:TEST_SITEKEY })
      }
    );

    const context = result.current as any;

    expect(context.ready).toBeTruthy();
  });

  it("should call onVerify when user passes hCaptcha", async () => {

    const { result } = renderHook(
      () => useHCaptcha(), {
        wrapper: createProvider(HCaptchaProvider, { sitekey:TEST_SITEKEY })
      }
    );

    await act(async () => {
      await (result.current as any).executeInstance();
    });

    // Check result.current after state update, not the stale captured context
    expect((result.current as any).token).toBe(MOCK_TOKEN);
  });
});