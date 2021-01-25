export const MOCK_WIDGET_ID = 'mock-widget-id';
export const MOCK_TOKEN = 'mock-token';
export const MOCK_EKEY = 'mock-ekey';

/*global jest*/

export function getMockedHcaptcha() {
    return {
        // eslint-disable-next-line no-unused-vars
        setData: jest.fn((id, data) => {}),
        // eslint-disable-next-line no-unused-vars
        render: jest.fn((container, opt) => MOCK_WIDGET_ID),
        getResponse: jest.fn(() => MOCK_TOKEN),
        getRespKey: jest.fn(() => MOCK_EKEY),
        reset: jest.fn(),
        execute: jest.fn(),
        remove: jest.fn(),
    };
}
