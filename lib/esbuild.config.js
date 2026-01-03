import { readFileSync } from 'fs';
import path, { resolve } from 'path';
import { fileURLToPath } from 'url';

import { build, context, analyzeMetafile } from 'esbuild';
import * as dotenv from 'dotenv';
import swc from '@swc/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const ROOT = resolve(__dirname, '..');
const DIST = resolve(__dirname, 'dist');
const SRC = resolve(__dirname, 'src');

const VERSION = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf-8')).version;

dotenv.config({
  path: `${ROOT}/.env`
});

const BUILD = process.env.BUILD || 'production';
const DEBUG = process.env.DEBUG === 'true';
const WATCH = process.env.WATCH === 'true';

const config = {
  /* Setup */
  bundle: true,
  entryPoints: [
    resolve(SRC, 'index.js'),
    resolve(SRC, 'hook', 'index.jsx')
  ],
  external: ['@hcaptcha/types'],
  loader: { '.js': 'jsx' },
  tsconfig: 'tsconfig.json',
  define: {
    'process.env.VERSION': JSON.stringify(VERSION),
  },

  /* Output */
  minify: true,

  /* CI */
  color: true,
  allowOverwrite: true,
  logLevel: 'info',

  /* Source Maps */
  metafile: DEBUG,
  sourcemap: BUILD === 'development',
};

const swcOptions = {
  minify: true,
  sourceMaps: BUILD === 'development',
  jsc: {
    target: 'es5',
  },
};


if (WATCH) {
  const ctx = await context({
    ...config,
    format: 'esm',
    treeShaking: true,
    target: [
      'es6'
    ]
  });
  await ctx.watch();
} else {
  // Transpile TypeScript to ESM
  const resultESM = await build({
    ...config,
    format: 'esm',
    outdir: 'dist/esm',
    treeShaking: true,
    target: [
      'es6'
    ]
  });

  // Transpile TypeScript to CommonJS
  const resultCJS = await build({
    ...config,
    format: 'cjs',
    outdir: 'dist/cjs',
    treeShaking: true,
  });

  if (DEBUG) {
    const analyzeESM = await analyzeMetafile(resultESM.metafile, {
      verbose: false
    });
    const analyzeCJS = await analyzeMetafile(resultCJS.metafile, {
      verbose: false
    });

    console.log(analyzeESM);
    console.log(analyzeCJS);
  }
}