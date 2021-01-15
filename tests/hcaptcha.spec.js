import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import HCaptcha from '../src/index';
import {getMockedHcaptcha, MOCK_EKEY, MOCK_TOKEN, MOCK_WIDGET_ID} from './hcaptcha.mock';


const TEST_PROPS = {
    sitekey: '10000000-ffff-ffff-ffff-000000000001',
    theme: 'light',
    size: 'invisible',
    tabindex: 0,
};

describe('hCaptcha', () => {
    let instance;
    let mockFns;

    beforeEach(() => {
        mockFns = {
            onChange: jest.fn(),
            onVerify: jest.fn(),
            onError: jest.fn(),
            onExpire: jest.fn(),
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
            />,
        );
    });

    it('renders into a div', () => {
        expect(ReactDOM.findDOMNode(instance).nodeName).toBe("DIV");
    });

    it('has functions', () => {
        expect(typeof instance.execute).toBe('function');
        expect(typeof instance.resetCaptcha).toBe('function');
        expect(instance.execute).toBeDefined();
        expect(instance.resetCaptcha).toBeDefined();
    });

    it('can execute', () => {
        expect(window.hcaptcha.execute.mock.calls.length).toBe(0);
        instance.execute();
        expect(window.hcaptcha.execute.mock.calls.length).toBe(1);
        expect(window.hcaptcha.execute.mock.calls[0][0]).toBe(MOCK_WIDGET_ID);
    });

    it('can reset', () => {
        expect(window.hcaptcha.reset.mock.calls.length).toBe(0);
        instance.resetCaptcha();
        expect(window.hcaptcha.reset.mock.calls.length).toBe(1);
        expect(window.hcaptcha.reset.mock.calls[0][0]).toBe(MOCK_WIDGET_ID);
    });

    it('can remove', () => {
        expect(window.hcaptcha.remove.mock.calls.length).toBe(0);
        instance.removeCaptcha();
        expect(window.hcaptcha.remove.mock.calls.length).toBe(1);
        expect(window.hcaptcha.remove.mock.calls[0][0]).toBe(MOCK_WIDGET_ID);
    });

    it('emits verify with token and eKey', () => {
        expect(mockFns.onVerify.mock.calls.length).toBe(0);
        instance.handleSubmit();
        expect(mockFns.onVerify.mock.calls.length).toBe(1);
        expect(mockFns.onVerify.mock.calls[0][0]).toBe(MOCK_TOKEN);
        expect(mockFns.onVerify.mock.calls[0][1]).toBe(MOCK_EKEY);
    });

    it('emits error and calls reset', () => {
        expect(mockFns.onError.mock.calls.length).toBe(0);
        const error = 'invalid-input-response';
        instance.handleError(error);
        expect(mockFns.onError.mock.calls.length).toBe(1);
        expect(mockFns.onError.mock.calls[0][0]).toBe(error);
        expect(window.hcaptcha.reset.mock.calls.length).toBe(1);
    });

    it('emits expire and calls reset', () => {
        expect(mockFns.onExpire.mock.calls.length).toBe(0);
        instance.handleExpire();
        expect(mockFns.onExpire.mock.calls.length).toBe(1);
        expect(window.hcaptcha.reset.mock.calls.length).toBe(1);
    });

    it('el renders after api loads and a widget id is set', () => {
        expect(instance.state.captchaId).toBe(MOCK_WIDGET_ID);
        expect(window.hcaptcha.render.mock.calls.length).toBe(1);
        expect(window.hcaptcha.render.mock.calls[0][1]).toMatchObject({
            sitekey: TEST_PROPS.sitekey,
            theme: TEST_PROPS.theme,
            size: TEST_PROPS.size,
            tabindex: TEST_PROPS.tabindex
        });
    });

});
