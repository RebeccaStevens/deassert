import type * as acorn from "acorn";
import { type SourceMapOptions } from "magic-string";

import { deassert } from "./deassert";

/**
 * The options that can be given to the {@link deassert} function.
 */
export type Options = {
  readonly modules?: ReadonlyArray<string> | undefined;
  readonly sourceMap?: boolean | SourceMapOptions | undefined;
  readonly ast?: Readonly<acorn.Node> | undefined;
  readonly acornOptions?: Readonly<acorn.Options> | undefined;
};

/**
 * The {@link Options} once defaults have been applied.
 */
export type FullOptions = {
  readonly modules: ReadonlyArray<string>;
  readonly sourceMap: boolean | SourceMapOptions;
  readonly ast?: Readonly<acorn.Node>;
  readonly acornOptions?: Readonly<acorn.Options>;
};

/**
 * Get the default options that are passed to {@link deassert}.
 */
export function defaultOptions() {
  return {
    modules: ["assert", "assert/strict", "node:assert", "node:assert/strict"],
    sourceMap: false,
    acornOptions: {
      sourceType: "module",
      ecmaVersion: "latest",
    },
  } satisfies FullOptions;
}

/**
 * Get the default options for the source map settings when {@link Options.sourceMap} is `true`.
 */
export function defaultSourceMapOptions() {
  return { hires: true } satisfies SourceMapOptions;
}
