// @ts-check
import rollupPluginTypescript from "@rollup/plugin-typescript";
import rollupPluginDeassert from "rollup-plugin-deassert";
import { generateDtsBundle } from "rollup-plugin-dts-bundle-generator";

import pkg from "./package.json" with { type: "json" };

const externalDependencies = [
  ...Object.keys(/** @type {any} */ (pkg).dependencies ?? {}),
  ...Object.keys(/** @type {any} */ (pkg).peerDependencies ?? {}),
];

export default {
  input: "src/index.ts",

  output: [
    {
      file: pkg.exports.default,
      format: "cjs",
      sourcemap: false,
      plugins: [
        generateDtsBundle({
          compilation: {
            preferredConfigPath: "tsconfig.json",
          },
          outFile: pkg.exports.types,
        }),
      ],
    },
  ],

  external: (source) => {
    if (source.startsWith("node:")) {
      return true;
    }
    if (externalDependencies.some((dep) => source.startsWith(dep))) {
      return true;
    }
    return undefined;
  },

  plugins: [
    rollupPluginTypescript({
      outputToFilesystem: true,
      compilerOptions: {
        noCheck: true,
      },
      tsconfig: "tsconfig.json",
    }),
    rollupPluginDeassert({
      include: ["**/*.{js,ts}"],
    }),
  ],

  treeshake: {
    annotations: true,
    moduleSideEffects: [],
    propertyReadSideEffects: false,
    unknownGlobalSideEffects: false,
  },
};
