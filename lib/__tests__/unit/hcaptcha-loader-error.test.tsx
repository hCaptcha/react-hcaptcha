import React from 'react';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, cleanup, render } from '@testing-library/react';

jest.mock('@hcaptcha/loader', () => ({
  hCaptchaLoader: jest.fn(),
}));

const mockHCaptchaLoader = require('@hcaptcha/loader').hCaptchaLoader;
const HCaptcha = require('../../src/index.js').default;

describe('hCaptcha loader errors', () => {
  beforeEach(() => {
    window.hcaptcha = undefined;
    mockHCaptchaLoader.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('normalizes script load errors', async () => {
    const onError = jest.fn();
    mockHCaptchaLoader.mockRejectedValueOnce(new Error('script-error'));

    await act(async () => {
      render(<HCaptcha sitekey="test-sitekey" onError={onError} />);
      await Promise.resolve();
    });

    expect(onError).toHaveBeenCalledWith('script-error');
  });

  it('reports when initial script error handling throws', async () => {
    const onError = jest.fn()
      .mockImplementationOnce(() => { throw new Error('error-handler-failed'); });
    mockHCaptchaLoader.mockRejectedValueOnce(new Error('script-error'));

    await act(async () => {
      render(<HCaptcha sitekey="test-sitekey" onError={onError} />);
      await Promise.resolve();
    });

    expect(onError.mock.calls).toEqual([
      ['script-error'],
      ['script-load-error-other'],
    ]);
  });
});
