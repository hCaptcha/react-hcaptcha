import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const root = dirname(fileURLToPath(import.meta.url));

export default {
  mode: 'development',
  entry: resolve(root, 'src/index.jsx'),
  output: { path: resolve(root, 'dist'), filename: 'demo.js', clean: true },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      react: resolve(root, 'node_modules/react'),
      'react-dom': resolve(root, 'node_modules/react-dom'),
    },
  },
  module: {
    rules: [{
      test: /\.[jt]sx?$/,
      exclude: /node_modules/,
      use: {
        loader: 'swc-loader',
        options: {
          jsc: {
            parser: { syntax: 'typescript', tsx: true },
            transform: { react: { runtime: 'automatic' } },
          },
        },
      },
    }],
  },
  plugins: [new HtmlWebpackPlugin({ template: resolve(root, 'src/index.html') })],
  devServer: { host: '127.0.0.1', port: 9001 },
};
