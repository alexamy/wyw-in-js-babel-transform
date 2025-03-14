import wyw from "@wyw-in-js/esbuild";
import { build } from "esbuild";
import babelPlugin from "esbuild-plugin-babel";
import fs from 'fs/promises';
import path from 'path';

const __dirname = new URL('.', import.meta.url).pathname;

// build
await build({
  logLevel: 'info',
  entryPoints: ["src/index.js"],
  outfile: "dist/index.js",
  plugins: [
    linaria(),
    // babel(),
  ],
});

// print files
const input = await fs.readFile('src/index.js', { encoding: 'utf-8' });
const output = await fs.readFile('dist/index.js', { encoding: 'utf-8' });
console.log('Build result:', { input, output });

// linaria plugin wrapper
function linaria() {
  return wyw({
    preprocessor: 'none',
  })
}

// babel plugin wrapper
function babel() {
  return babelPlugin({
    filter: /\.js$/,
    config: {
      plugins: [
        path.resolve(__dirname, 'babelPlugin.js'),
      ],
    },
  });
}
