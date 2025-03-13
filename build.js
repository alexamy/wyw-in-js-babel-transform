import { build } from "esbuild";
import babelPlugin from "esbuild-plugin-babel";

await build({
  logLevel: 'info',
  entryPoints: ["src/index.js"],
  outfile: "dist/index.js",
  plugins: [
    babel(),
  ],
});

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
