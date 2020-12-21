import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import HCaptcha from '../src/index'; // eslint-disable-line no-unused-vars

describe('hCaptcha', () => {
    it('Rendered Component should be a div', () => {
        const instance = ReactTestUtils.renderIntoDocument(
            <HCaptcha sitekey="10000000-ffff-ffff-ffff-000000000001" onChange={jest.fn()} />,
        );
        expect(ReactDOM.findDOMNode(instance).nodeName).toBe("DIV");
    });
});
