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

export type FullOptions = {
  readonly modules: ReadonlyArray<string>;
  readonly sourceMap: boolean | SourceMapOptions;
  readonly ast?: Readonly<acorn.Node>;
  readonly acornOptions?: Readonly<acorn.Options>;
};

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

export function defaultSourceMapOptions() {
  return { hires: true } satisfies SourceMapOptions;
}
