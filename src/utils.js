function generateQuery(params) {
  return Object.entries(params)
    .filter(([key, value]) => value || value === false)
    .map(([key, value]) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    }).join("&");
};

function getFrame(element) {
  const doc = (element && element.ownerDocument) || document;
  const win = doc.defaultView || doc.parentWindow || window;

  return { document: doc, window: win };
}

function getMountElement(element) {
  return element || document.head;
}

export {
  generateQuery,
  getFrame,
  getMountElement
};