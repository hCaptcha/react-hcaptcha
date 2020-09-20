// NPM Modules
const Webpack = require("webpack");
const Path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

// Webpack Plugins
const htmlPlugin = new HtmlWebpackPlugin({
  template: Path.join(__dirname, "./examples/src/index.html"),
  filename: "./index.html",
});

module.exports = {
  entry: Path.join(__dirname, "./examples/src/index.js"),

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
    ],
  },

  resolve: {
    extensions: ["*", ".js", ".jsx"],
  },

  output: {
    path: __dirname + "/dist",
    publicPath: "/",
    filename: "bundle.js",
  },

  plugins: [htmlPlugin],

  devServer: {
    port: 9000,
    disableHostCheck: true,
  },
};
