import type { RollupOptions } from "rollup";
import rollupPluginShebang from "rollup-plugin-shebang-bin";
import rollupPluginTs from "rollup-plugin-ts";
import { tsImport } from "tsx/esm/api";

import pkg from "./package.json" with { type: "json" };

const { default: rollupPluginDeassert } = (await tsImport(
  "../rollup-plugin/src/index.ts",
  import.meta.url,
)) as typeof import("../rollup-plugin/src/index.ts");

type PackageJSON = typeof pkg & {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

const externalDependencies = [
  ...Object.keys((pkg as PackageJSON).dependencies),
  ...Object.keys((pkg as PackageJSON).peerDependencies ?? {}),
];

export default {
  input: "src/index.ts",

  output: [
    {
      file: pkg.bin,
      format: "esm",
      sourcemap: false,
    },
  ],

  plugins: [
    rollupPluginTs({
      transpileOnly: true,
      tsconfig: {
        fileName: "./tsconfig.json",
        hook: (resolvedConfig) => {
          resolvedConfig.declaration = false;
          return resolvedConfig;
        },
      },
    }),
    rollupPluginDeassert({
      include: ["**/*.ts"],
    }),
    rollupPluginShebang({
      include: ["src/index.ts"],
    }),
  ],

  treeshake: {
    annotations: true,
    moduleSideEffects: [],
    propertyReadSideEffects: false,
    unknownGlobalSideEffects: false,
  },

  external: (source) => {
    if (source.startsWith("node:") || externalDependencies.some((dep) => source.startsWith(dep))) {
      return true;
    }
    return undefined;
  },
} as RollupOptions;
