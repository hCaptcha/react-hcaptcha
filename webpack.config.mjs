import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SRC_DIR  = resolve(__dirname, 'src');
const DIST_DIR = resolve(__dirname, 'dist');
const DEMO_DIR = resolve(__dirname, 'demo');

export default {
  mode: 'development',

  entry: {
    demo: resolve(DEMO_DIR, 'index.js'),
  },

  output: {
    path: DIST_DIR,
    filename: '[name].js'
  },

  resolve: {
    extensions: ['.json', '.js', '.ts']
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: resolve(DEMO_DIR, 'index.html'),
      inject: true
    })
  ],

  devServer: {
    port: 9000
  }
};