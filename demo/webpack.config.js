import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DIST_DIR = resolve(__dirname, 'dist');

export default {
  mode: 'development',

  entry: {
    demo: resolve(__dirname, 'src', 'index.jsx'),
  },

  output: {
    path: DIST_DIR,
    filename: '[name].js'
  },

  resolve: {
    extensions: ['.json', '.js', '.jsx', '.ts', '.tsx']
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
        }
      }
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: resolve(__dirname, 'src', 'index.html'),
      inject: true
    }),
    new HtmlWebpackPlugin({
      filename: 'frame.html',
      template: resolve(__dirname, 'src', 'frame.html'),
      inject: false
    })
  ],

  devServer: {
    port: 9000,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': '*',
    }
  }
};