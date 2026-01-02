module.exports = function fullySpecifiedRelativeImports() {
  function isRelative(specifier) {
    return specifier.startsWith("./") || specifier.startsWith("../");
  }

  function hasKnownExtension(specifier) {
    return /\.[a-zA-Z0-9]+$/.test(specifier);
  }

  function fullySpecify(specifier) {
    if (!isRelative(specifier)) return specifier;
    if (hasKnownExtension(specifier)) return specifier;
    return `${specifier}.js`;
  }

  function rewriteSource(sourceNode) {
    if (!sourceNode || typeof sourceNode.value !== "string") return;
    sourceNode.value = fullySpecify(sourceNode.value);
  }

  return {
    name: "fully-specified-relative-imports",
    visitor: {
      ImportDeclaration(path) {
        rewriteSource(path.node.source);
      },
      ExportNamedDeclaration(path) {
        rewriteSource(path.node.source);
      },
      ExportAllDeclaration(path) {
        rewriteSource(path.node.source);
      },
      CallExpression(path) {
        if (path.node.callee.type !== "Import") return;
        const [firstArg] = path.node.arguments;
        if (!firstArg || firstArg.type !== "StringLiteral") return;
        firstArg.value = fullySpecify(firstArg.value);
      },
    },
  };
};
