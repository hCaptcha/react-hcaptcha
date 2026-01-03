import { readFileSync } from 'fs';
import path, { resolve } from 'path';
import { fileURLToPath } from 'url';

import { build, context, analyzeMetafile } from 'esbuild';
import * as dotenv from 'dotenv';

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

console.log(`Build: ${BUILD}`);
console.log(`Debug: ${DEBUG}`);

const config = {
  /* Setup */
  bundle: true,
  entryPoints: [
    resolve(SRC, 'index.js'),
    resolve(SRC, 'hook', 'index.js')
  ],
  external: [
    '@hcaptcha/types',
    'react',
    'react-dom'
  ],
  tsconfig: 'tsconfig.json',
  define: {
    'process.env.VERSION': JSON.stringify(VERSION),
  },

  /* Output */
  minify: BUILD === 'production',

  /* CI */
  color: true,
  allowOverwrite: true,
  logLevel: 'info',

  /* Source Maps */
  metafile: DEBUG,
  sourcemap: BUILD !== 'production',
};

if (WATCH) {
  const ctx = await context({
    ...config,
    format: 'esm',
    outdir: resolve(DIST, 'esm'),
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
    outdir: resolve(DIST, 'esm'),
    treeShaking: true,
    target: [
      'es6'
    ]
  });

  // Transpile TypeScript to CommonJS
  const resultCJS = await build({
    ...config,
    format: 'cjs',
    outdir: resolve(DIST, 'cjs'),
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