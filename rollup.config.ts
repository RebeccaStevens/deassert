import rollupPluginReplace from "@rollup/plugin-replace";
import type { RollupOptions } from "rollup";
import rollupPluginShebang from "rollup-plugin-shebang-bin";
import rollupPluginTs from "rollup-plugin-ts";

import pkg from "./package.json" with { type: "json" };
import rollupPluginDeassert from "./src/rollup/local";

type PackageJSON = typeof pkg & {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

const externalDependencies = [
  ...Object.keys((pkg as PackageJSON).dependencies),
  ...Object.keys((pkg as PackageJSON).peerDependencies),
];

const external: RollupOptions["external"] = (source) => {
  if (
    source === "deassert" ||
    source.startsWith("node:") ||
    externalDependencies.some((dep) => source.startsWith(dep))
  ) {
    return true;
  }
  return undefined;
};

const treeshake = {
  annotations: true,
  moduleSideEffects: [],
  propertyReadSideEffects: false,
  unknownGlobalSideEffects: false,
} satisfies RollupOptions["treeshake"];

const library = {
  input: "src/index.ts",

  output: [
    {
      file: pkg.exports["."].import,
      format: "esm",
      sourcemap: false,
    },
    {
      file: pkg.exports["."].require,
      format: "cjs",
      sourcemap: false,
    },
  ],

  plugins: [
    rollupPluginTs({
      transpileOnly: true,
      tsconfig: "./tsconfig.build.json",
    }),
    rollupPluginReplace({
      values: {
        "import.meta.vitest": "undefined",
      },
      preventAssignment: true,
    }),
    rollupPluginDeassert({
      include: ["**/*.ts"],
    }),
  ],

  treeshake,

  external,
} satisfies RollupOptions;

const bin = {
  input: "src/cli.ts",

  output: {
    file: pkg.bin,
    format: "esm",
    sourcemap: false,
  },

  plugins: [
    rollupPluginTs({
      transpileOnly: true,
      tsconfig: "./tsconfig.build.json",
    }),
    rollupPluginReplace({
      values: {
        "import.meta.vitest": "undefined",
      },
      preventAssignment: true,
    }),
    rollupPluginDeassert({
      include: ["**/*.ts"],
    }),
    rollupPluginShebang({
      include: ["src/cli.ts"],
    }),
  ],

  treeshake,

  external,
} satisfies RollupOptions;

const rollupPlugin = {
  input: "src/rollup/plugin.ts",

  output: [
    {
      file: pkg.exports["./rollup-plugin"].default,
      format: "esm",
      sourcemap: false,
    },
  ],

  plugins: [
    rollupPluginTs({
      transpileOnly: true,
      tsconfig: "./tsconfig.build.json",
    }),
    rollupPluginReplace({
      values: {
        "import.meta.vitest": "undefined",
      },
      preventAssignment: true,
    }),
    rollupPluginDeassert({
      include: ["**/*.ts"],
    }),
  ],

  treeshake,

  external,
} satisfies RollupOptions;

const webpackLoader = {
  input: "src/webpack/loader.cts",

  output: [
    {
      file: pkg.exports["./webpack-loader"].default,
      format: "cjs",
      sourcemap: false,
    },
  ],

  plugins: [
    rollupPluginTs({
      transpileOnly: true,
      tsconfig: "./src/webpack/tsconfig.json",
    }),
    rollupPluginReplace({
      values: {
        "import.meta.vitest": "undefined",
      },
      preventAssignment: true,
    }),
    rollupPluginDeassert({
      include: ["**/*.ts"],
    }),
  ],

  treeshake,

  external,
} satisfies RollupOptions;

export default [library, bin, rollupPlugin, webpackLoader];
