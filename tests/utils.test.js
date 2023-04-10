import { describe, jest, it } from "@jest/globals";

import { generateQuery, getFrame } from "../src/utils.js";

describe("generateQuery", () => {

    it("Property foo to equal bar as string foo=bar:", () => {
        const params = {
            foo: "bar"
        };
        expect(generateQuery(params)).toBe("foo=bar");
    });

    it("Spaces to be encoded with %20", () => {
        const params = {
            foo: "bar baz bah"
        };
        expect(generateQuery(params)).toBe("foo=bar%20baz%20bah");
    });

    it("Chain multiple parameters", () => {
        const params = {
            foo: "bar",
            baz: true
        };
        expect(generateQuery(params)).toBe("foo=bar&baz=true");
    });

    it("false should be a valid query value", () => {
        const params = {
            foo: false
        };
        expect(generateQuery(params)).toBe("foo=false");
    });

    it("Null, undefined, and empty string values should be removed", () => {
        const params = {
            foo: "",
            bar: null,
            baz: undefined,
            bah: true
        };
        expect(generateQuery(params)).toBe("bah=true");
    });

});


describe("getFrame", () => {

    it("should return the default document and window for the root application", () => {
        const frame = getFrame();
        expect(frame.document).toEqual(document);
        expect(frame.window).toEqual(global);
    });

    it("should return the root document and window for the supplied element in the root application", () => {
        const element = document.createElement('div');
        document.body.appendChild(element);

        const frame = getFrame(element);
        expect(frame.document).toEqual(document);
        expect(frame.window).toEqual(global);

        // clean up
        document.body.removeChild(element);
    });

    it("should return the corresponding frame document and window for the an element found in another document", () => {
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);

        const frameWindow = iframe.contentWindow;
        const frameDocument = frameWindow.document;

        const element = frameDocument.createElement('div');
        frameDocument.body.appendChild(element);

        const frame = getFrame(element);
        expect(frame.document).toEqual(frameDocument);
        expect(frame.window).toEqual(frameWindow);

        expect(frame.document).not.toEqual(document);
        expect(frame.window).not.toEqual(global);

        // clean up
        document.body.removeChild(iframe);
    });

});
