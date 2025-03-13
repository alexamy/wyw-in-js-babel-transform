import { build } from "esbuild";
import babelPlugin from "esbuild-plugin-babel";

// build
await build({
  logLevel: 'info',
  entryPoints: ["src/index.js"],
  outfile: "dist/index.js",
  plugins: [
    babel(),
  ],
});

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
