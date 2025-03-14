/**
 * https://github.com/Anber/wyw-in-js/blob/05d3d7234728a8574792d185a8fcb412696707fa/packages/esbuild/src/index.ts
 *
 * This file contains an esbuild loader for wyw-in-js.
 * It uses the transform.ts function to generate class names from source code,
 * returns transformed code without template literals and attaches generated source maps
 */

import { readFileSync } from 'fs';
import { basename, dirname, isAbsolute, join, parse, posix } from 'path';

import type { Plugin, TransformOptions, Loader } from 'esbuild';
import { transformSync } from 'esbuild';

import type {
  PluginOptions,
  Preprocessor,
} from '@wyw-in-js/transform';

import {
  slugify,
  transform,
  TransformCacheCollection,
} from '@wyw-in-js/transform';

type EsbuildPluginOptions = {
  filter?: RegExp | string;
  esbuildOptions?: TransformOptions;
  preprocessor?: Preprocessor;
} & Partial<PluginOptions>;

const nodeModulesRegex = /^(?:.*[\\/])?node_modules(?:[\\/].*)?$/;

export default function wywInJS({
  preprocessor,
  esbuildOptions,
  filter = /\.(js|jsx|ts|tsx)$/,
  ...rest
}: EsbuildPluginOptions = {}): Plugin {
  let options = esbuildOptions;
  const cache = new TransformCacheCollection();
  return {
    name: 'wyw-in-js',
    setup(build) {
      const cssLookup = new Map<string, string>();

      const asyncResolve = async (
        token: string,
        importer: string
      ): Promise<string> => {
        const context = isAbsolute(importer)
          ? dirname(importer)
          : join(process.cwd(), dirname(importer));

        const result = await build.resolve(token, {
          resolveDir: context,
          kind: 'import-statement',
        });

        if (result.errors.length > 0) {
          throw new Error(`Cannot resolve ${token}`);
        }

        return result.path.replace(/\\/g, posix.sep);
      };

      build.onResolve({ filter: /\.wyw\.css$/ }, (args) => {
        return {
          namespace: 'wyw-in-js',
          path: args.path,
        };
      });

      build.onLoad({ filter: /.*/, namespace: 'wyw-in-js' }, (args) => {
        return {
          contents: cssLookup.get(args.path),
          loader: 'css',
          resolveDir: basename(args.path),
        };
      });

      const filterRegexp =
        typeof filter === 'string' ? new RegExp(filter) : filter;

      build.onLoad({ filter: filterRegexp }, async (args) => {
        const rawCode = readFileSync(args.path, 'utf8');
        const { ext, name: filename } = parse(args.path);
        const loader = ext.replace(/^\./, '') as Loader;

        if (nodeModulesRegex.test(args.path)) {
          return {
            loader,
            contents: rawCode,
          };
        }

        if (!options) {
          options = {};
          if ('jsxFactory' in build.initialOptions) {
            options.jsxFactory = build.initialOptions.jsxFactory;
          }
          if ('jsxFragment' in build.initialOptions) {
            options.jsxFragment = build.initialOptions.jsxFragment;
          }
        }

        const transformed = transformSync(rawCode, {
          ...options,
          sourcefile: args.path,
          loader,
        });
        let { code } = transformed;

        const transformServices = {
          options: {
            filename: args.path,
            root: process.cwd(),
            preprocessor,
            pluginOptions: rest,
          },
          cache,
        };

        const result = await transform(transformServices, code, asyncResolve);

        if (!result.cssText) {
          return {
            contents: code,
            loader,
            resolveDir: dirname(args.path),
          };
        }

        let { cssText } = result;

        const slug = slugify(cssText);
        const cssFilename = `${filename}_${slug}.wyw.css`;

        let contents = `import ${JSON.stringify(cssFilename)}; ${result.code}`;

        cssLookup.set(cssFilename, cssText);

        return {
          contents,
          loader,
          resolveDir: dirname(args.path),
        };
      });
    },
  };
}
