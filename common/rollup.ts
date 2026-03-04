import fsp from "node:fs/promises";
import { URL } from "node:url";

// eslint-disable-next-line import/no-extraneous-dependencies -- unknown reason why this is reported.
import { createJiti } from "jiti";

import type RollupPluginDeassert from "../packages/rollup-plugin/src/index.ts";

const jiti = createJiti(import.meta.url);

/**
 * Get the local version of our rollup plugin.
 */
async function getLocalRollupPluginDeassert(): Promise<typeof RollupPluginDeassert> {
  const filepath = new URL("../packages/rollup-plugin/src/index.ts", import.meta.url);
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

/**
 * The local version of our rollup plugin.
 */
export const rollupPluginDeassert: typeof RollupPluginDeassert = await getLocalRollupPluginDeassert();
