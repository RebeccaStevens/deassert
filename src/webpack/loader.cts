import type { LoaderContext, LoaderDefinitionFunction } from "webpack";

import type { Options as DeassertOptions } from "../options";

// eslint-disable-next-line ts/no-unsafe-assignment
const acorn: typeof import("acorn") = require("acorn");
// eslint-disable-next-line ts/no-unsafe-assignment
const deassert: typeof import("../") = require("deassert");

export type Options = Omit<DeassertOptions, "sourceMap" | "ast">;

module.exports = function deassertLoader(
  this: LoaderContext<Options>,
  source: string,
) {
  const { acornOptions, ...options } = this.getOptions();

  const ast = acorn.parse(
    source,
    acornOptions ?? {
      ecmaVersion: "latest",
    },
  );
  const { code } = deassert.default(source, {
    ...options,
    ast,
    sourceMap: this.sourceMap ?? false,
  });

  return code;
} satisfies LoaderDefinitionFunction<Options>;
