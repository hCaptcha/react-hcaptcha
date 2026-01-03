import { describe, jest, it } from "@jest/globals";

import { getFrame, getMountElement } from "../../src/utils.js";


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

describe("getMountElement", () => {

    it("should return document.head by default", () => {
        const mountElement = getMountElement();
        expect(mountElement).toEqual(document.head);
    });

    it("should return element passed in", () => {
        const element = document.createElement('div');
        const mountElement = getMountElement(element);
        expect(mountElement).toEqual(element);
    });

});
