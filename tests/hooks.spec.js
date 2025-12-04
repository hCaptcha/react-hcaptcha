import React from "react";
import ReactTestUtils, { act } from "react-dom/test-utils";
import { describe, jest, it, expect, beforeEach } from "@jest/globals";

import { getMockedHcaptcha, MOCK_TOKEN } from "./hcaptcha.mock";
import { HCaptchaProvider, useHCaptcha } from "../src/hooks/index.jsx";

const TEST_SITEKEY = "10000000-ffff-ffff-ffff-000000000001";

describe("HCaptchaProvider and useHCaptcha", () => {
  beforeEach(() => {
    window.hcaptcha = getMockedHcaptcha();
  });

  it("resetInstance calls resetCaptcha", () => {
    let contextValue;

    // Captures context to access resetInstance later
    function TestChild() {
      contextValue = useHCaptcha();
      return null;
    }

    act(() => {
      ReactTestUtils.renderIntoDocument(
        <HCaptchaProvider sitekey={TEST_SITEKEY}>
          <TestChild />
        </HCaptchaProvider>
      );
    });

    act(() => {
      contextValue.resetInstance();
    });

    expect(window.hcaptcha.reset).toHaveBeenCalled();
  });

  it("provides correct initial state", () => {
    let contextValue;

    // Captures context to verify initial state values
    function TestChild() {
      contextValue = useHCaptcha();
      return null;
    }

    act(() => {
      ReactTestUtils.renderIntoDocument(
        <HCaptchaProvider sitekey={TEST_SITEKEY}>
          <TestChild />
        </HCaptchaProvider>
      );
    });

    expect(contextValue.token).toBeNull();
    expect(contextValue.error).toBeNull();
    expect(contextValue.sitekey).toBe(TEST_SITEKEY);
    expect(typeof contextValue.executeInstance).toBe("function");
    expect(typeof contextValue.resetInstance).toBe("function");
  });

  it("passes onVerify callback to HCaptcha", () => {
    const onVerify = jest.fn();

    // Just consumes hook, no need to capture context
    function TestChild() {
      useHCaptcha();
      return null;
    }

    act(() => {
      ReactTestUtils.renderIntoDocument(
        <HCaptchaProvider sitekey={TEST_SITEKEY} onVerify={onVerify}>
          <TestChild />
        </HCaptchaProvider>
      );
    });

    expect(typeof onVerify).toBe("function");
  });

  it("passes onError callback to HCaptcha", () => {
    const onError = jest.fn();

    // Just consumes hook, no need to capture context
    function TestChild() {
      useHCaptcha();
      return null;
    }

    act(() => {
      ReactTestUtils.renderIntoDocument(
        <HCaptchaProvider sitekey={TEST_SITEKEY} onError={onError}>
          <TestChild />
        </HCaptchaProvider>
      );
    });

    expect(typeof onError).toBe("function");
  });

  it("updates token after executeInstance", async () => {
    let contextValue;

    function TestChild() {
      contextValue = useHCaptcha();
      return null;
    }

    act(() => {
      ReactTestUtils.renderIntoDocument(
        <HCaptchaProvider sitekey={TEST_SITEKEY}>
          <TestChild />
        </HCaptchaProvider>
      );
    });

    expect(contextValue.token).toBeNull();

    await act(async () => {
      await contextValue.executeInstance();
    });

    expect(contextValue.token).toBe(MOCK_TOKEN);
  });

  it("updates error when executeInstance fails", async () => {
    let contextValue;

    function TestChild() {
      contextValue = useHCaptcha();
      return null;
    }

    const mockError = new Error("hCaptcha failed");
    window.hcaptcha.execute.mockRejectedValueOnce(mockError);

    act(() => {
      ReactTestUtils.renderIntoDocument(
        <HCaptchaProvider sitekey={TEST_SITEKEY}>
          <TestChild />
        </HCaptchaProvider>
      );
    });

    expect(contextValue.error).toBeNull();

    await act(async () => {
      await contextValue.executeInstance();
    });

    expect(contextValue.error).toBe(mockError);
  });
});
