function getFrame(element) {
  const doc = (element && element.ownerDocument) || document;
  const win = doc.defaultView || doc.parentWindow || window;

  return { document: doc, window: win };
}

function getMountElement(element) {
  return element || document.head;
}

export {
  getFrame,
  getMountElement
};
