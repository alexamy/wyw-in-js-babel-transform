import { build } from "esbuild";

build({
  entryPoints: ["src/index.js"],
  outfile: "dist/index.js",
});

console.log("Build completed.");
