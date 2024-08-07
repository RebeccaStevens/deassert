import { type FilterPattern, createFilter } from "@rollup/pluginutils";
import type * as acorn from "acorn";
import type { Plugin } from "rollup";

// eslint-disable-next-line import/no-duplicates
import type { Options as DeassertOptions } from "..";
// eslint-disable-next-line import/no-duplicates
import type deassertFn from "..";

export type Options = {
  include?: FilterPattern;
  exclude?: FilterPattern;
  sourcemap?: boolean;
  deassert?: Omit<DeassertOptions, "sourceMap" | "ast" | "acornOptions">;
};

export default (deassert: typeof deassertFn) =>
  function deassertRollupPlugin(options: Options = {}): Plugin {
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
  };
