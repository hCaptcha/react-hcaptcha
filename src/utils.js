function generateQuery(params) {
    return Object.entries(params)
        .filter(([key, value]) => value || value === false)
        .map(([key, value]) => {
            return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
        }).join("&");
};

function getFrame(element) {
    const doc = (element && element.ownerDocument) || document;
    const win = doc.defaultView || doc.parentWindow;
    return { document: doc, window: win };
}

export {
    generateQuery,
    getFrame
};