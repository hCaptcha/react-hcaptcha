import { generateQuery } from "../src/utils.js";

describe("Encode query", () => {

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

    it("false should be a valid query parameter", () => {
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
