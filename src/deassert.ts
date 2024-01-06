import * as acorn from "acorn";
import MagicString, { type SourceMap } from "magic-string";

import {
  type Options,
  type FullOptions,
  defaultOptions,
  defaultSourceMapOptions,
} from "./options";
import { process } from "./process";

/**
 * Remove assertions form the given code, returning the changes.
 *
 * @param code
 * @param options
 * @returns The modified code and the source map for the changes.
 */
export function deassert(
  code: string,
  options?: Options,
): {
  code: string;
  map: SourceMap | null;
};

/**
 * Remove assertions form the given code by mutating the given Magic String.
 *
 * @param code
 * @param options
 */
export function deassert(code: MagicString, options?: Options): void;

export function deassert(code: string | MagicString, options?: Options) {
  const { ast, acornOptions, sourceMap, modules }: FullOptions =
    options === undefined
      ? defaultOptions()
      : ({
          ...defaultOptions(),
          ...Object.fromEntries(
            Object.entries(options).filter(([k, v]) => v !== undefined),
          ),
        } as FullOptions);

  const usingMagic = code instanceof MagicString;
  const magicCode = usingMagic ? code : new MagicString(code);
  const codeAst = ast ?? acorn.parse(code.toString(), acornOptions!);

  process(codeAst, magicCode, modules);

  if (usingMagic) {
    return;
  }

  return {
    code: magicCode.toString(),
    map:
      sourceMap === false
        ? null
        : magicCode.generateMap(
            sourceMap === true ? defaultSourceMapOptions() : sourceMap,
          ),
  };
}
