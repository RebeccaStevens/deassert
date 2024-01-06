import { type RollupOptions } from "rollup";
import rollupPluginAutoExternal from "rollup-plugin-auto-external";
import rollupPluginShebang from "rollup-plugin-shebang-bin";
import rollupPluginTs from "rollup-plugin-ts";

import pkg from "./package.json" assert { type: "json" };
import { rollupPlugin as rollupDeassert } from "./src";

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
      file: pkg.exports.import,
      format: "esm",
      sourcemap: false,
    },
    {
      file: pkg.exports.require,
      format: "cjs",
      sourcemap: false,
    },
  ],

  plugins: [
    rollupPluginAutoExternal(),
    rollupPluginTs({
      transpileOnly: true,
    }),
    rollupDeassert({
      include: ["**/*.ts"],
    }),
  ],

  treeshake,
} satisfies RollupOptions;

const bin = {
  input: "src/cli.ts",

  output: {
    file: pkg.bin,
    format: "esm",
    sourcemap: false,
  },

  plugins: [
    rollupPluginAutoExternal(),
    rollupPluginTs({
      transpileOnly: true,
    }),
    rollupDeassert({
      include: ["**/*.ts"],
    }),
    rollupPluginShebang({
      include: ["src/cli.ts"],
    }),
  ],

  treeshake,

  external: ["deassert"],
} satisfies RollupOptions;

export default [library, bin];
