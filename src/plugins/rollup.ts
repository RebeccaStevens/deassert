import { type FilterPattern, createFilter } from "@rollup/pluginutils";
import type * as acorn from "acorn";
import type { Plugin } from "rollup";

import { deassert } from "../deassert";
import type { Options as DeassertOptions } from "../options";

export type Options = {
  include?: FilterPattern;
  exclude?: FilterPattern;
  sourcemap?: boolean;
  deassert?: Omit<DeassertOptions, "sourceMap" | "ast" | "acornOptions">;
};

export default function deassertRollupPlugin(options: Options = {}): Plugin {
  const filter = createFilter(
    options.include ?? ["*.js", "**/*.js"],
    options.exclude,
  );

  return {
    name: "deassert",
    transform(code, id) {
      if (!filter(id)) {
        return null;
      }

      const ast = this.parse(code) as acorn.Program;
      return deassert(code, {
        ...options.deassert,
        ast,
        sourceMap: options.sourcemap ?? false,
      });
    },
  };
}
