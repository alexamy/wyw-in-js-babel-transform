import wyw from "@wyw-in-js/esbuild";
import { build } from "esbuild";
import babelPlugin from "esbuild-plugin-babel";
import fs from 'fs/promises';

// WARNING: When using the Linaria, change the babel plugin path to an absolute one in your system
// because relative paths combined with the cwd do not work with Linaria,
// but work with the Babel esbuild plugin.

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
    babelOptions: {
      plugins: [
        // MODIFY THIS PATH TO ABSOLUTE PATH IN YOUR SYSTEM
        '/home/alex/hobby/wyw-in-js-babel-transform/babelPlugin.js',
      ]
    },
  })
}

// babel plugin wrapper
function babel() {
  return babelPlugin({
    filter: /\.js$/,
    config: {
      cwd: process.cwd(),
      plugins: [
        './babelPlugin.js'
      ],
    },
  });
}
