import type * as acorn from "acorn";
import type { SourceMapOptions } from "magic-string";

/**
 * @typedef {import("./deassert").deassert} deassert
 */

/**
 * The options that can be given to the {@link deassert} function.
 */
export type Options = Readonly<{
  modules?: ReadonlyArray<string> | undefined;
  sourceMap?: boolean | SourceMapOptions | undefined;
  ast?: Readonly<acorn.Node> | undefined;
  acornOptions?: Readonly<acorn.Options> | undefined;
}>;

/**
 * The {@link Options} once defaults have been applied.
 */
export type FullOptions = Readonly<{
  modules: ReadonlyArray<string>;
  sourceMap: boolean | SourceMapOptions;
  ast?: Readonly<acorn.Node>;
  acornOptions?: Readonly<acorn.Options>;
}>;

/**
 * Get the default options that are passed to {@link deassert}.
 */
export function defaultOptions(): FullOptions {
  return {
    modules: ["assert", "assert/strict", "node:assert", "node:assert/strict"],
    sourceMap: false,
    acornOptions: {
      sourceType: "module",
      ecmaVersion: "latest",
    },
  };
}

/**
 * Get the default options for the source map settings when {@link Options.sourceMap} is `true`.
 */
export function defaultSourceMapOptions(): SourceMapOptions {
  return { hires: true };
}
