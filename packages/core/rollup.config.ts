import fsp from "node:fs/promises";
import { URL } from "node:url";

import rollupPluginTypescript from "@rollup/plugin-typescript";
import { createJiti } from "jiti";
import type { RollupOptions } from "rollup";
import generateDtsBundle from "rollup-plugin-dts-bundle-generator-2";

// eslint-disable-next-line ts/ban-ts-comment -- TODO: Remove this
// @ts-ignore
import pkg from "./package.json" with { type: "json" };

const jiti = createJiti(import.meta.url);

/**
 * @type {typeof import("../rollup-plugin/src/index.ts").default}
 */
const rollupPluginDeassert = await loadLocalRollupPluginDeassert();

async function loadLocalRollupPluginDeassert() {
  const filepath = new URL("../rollup-plugin/src/index.ts", import.meta.url);
  const id = jiti.esmResolve(filepath.pathname);
  const source = await fsp.readFile(filepath, "utf8");
  const patchedSource = source.replace(`from "deassert"`, `from "../../core/src/index.ts"`);
  const result: any = await jiti.evalModule(patchedSource, {
    id,
    async: true,
    filename: filepath.pathname,
    ext: ".ts",
  });
  return result.default;
}

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
      compilerOptions: {
        noCheck: true,
      },
      tsconfig: "tsconfig.json",
      outDir: "dist",
    }),
    rollupPluginDeassert({
      include: ["**/*.{js,ts}"],
    }),
    generateDtsBundle({
      compilation: {
        preferredConfigPath: "tsconfig.json",
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
