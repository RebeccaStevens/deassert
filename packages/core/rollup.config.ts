import rollupPluginTypescript from "@rollup/plugin-typescript";
import type { RollupOptions } from "rollup";
import generateDtsBundle from "rollup-plugin-dts-bundle-generator-2";
import { tsImport } from "tsx/esm/api";

// @ts-ignore
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
      file: pkg.exports.import,
      format: "esm",
      sourcemap: false,
      importAttributesKey: "with",
    },
    {
      file: pkg.exports.require,
      format: "cjs",
      sourcemap: false,
    },
  ],

  plugins: [
    rollupPluginTypescript({
      tsconfig: "./tsconfig.json",
      outDir: "dist",
      noCheck: true,
    }),
    rollupPluginDeassert({
      include: ["**/*.{js,ts}"],
    }),
    generateDtsBundle({
      compilation: {
        preferredConfigPath: "./tsconfig.json",
      },
      output: {
        exportReferencedTypes: false,
        inlineDeclareExternals: true,
      },
    }),
  ],

  treeshake: {
    annotations: true,
    moduleSideEffects: [],
    propertyReadSideEffects: false,
    unknownGlobalSideEffects: false,
  },

  external: (source) => {
    if (
      source.startsWith("node:") ||
      externalDependencies.some((dep) => dep === source || source.startsWith(`${dep}/`))
    ) {
      return true;
    }
    return undefined;
  },
} satisfies RollupOptions;
