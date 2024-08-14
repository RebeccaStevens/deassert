import acorn from "acorn";
import deassert, { type Options as DeassertOptions } from "deassert";
import type { LoaderContext, LoaderDefinitionFunction } from "webpack";

export type Options = Omit<DeassertOptions, "sourceMap" | "ast">;

export default (function deassertLoader(this: LoaderContext<Options>, source: string) {
  const {
    acornOptions = {
      sourceType: "module",
      ecmaVersion: "latest",
    },
    ...options
  } = {
    modules: ["assert", "assert/strict", "node:assert", "node:assert/strict"],
    ...this.getOptions(),
  };

  const ast = acorn.parse(source, acornOptions);
  const { code } = deassert(source, {
    ...options,
    ast,
    sourceMap: this.sourceMap ?? false,
  });

  return code;
} as LoaderDefinitionFunction<Options>);
