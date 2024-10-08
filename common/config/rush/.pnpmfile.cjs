'use strict';

/**
 * When using the PNPM package manager, you can use pnpmfile.js to workaround
 * dependencies that have mistakes in their package.json file.  (This feature is
 * functionally similar to Yarn's "resolutions".)
 *
 * For details, see the PNPM documentation:
 * https://pnpm.io/pnpmfile#hooks
 *
 * IMPORTANT: SINCE THIS FILE CONTAINS EXECUTABLE CODE, MODIFYING IT IS LIKELY TO INVALIDATE
 * ANY CACHED DEPENDENCY ANALYSIS.  After any modification to pnpmfile.js, it's recommended to run
 * "rush update --full" so that PNPM will recalculate all version selections.
 */
module.exports = {
  hooks: {
    readPackage
  }
};

/**
 * This hook is invoked during installation before a package's dependencies
 * are selected.
 * The `packageJson` parameter is the deserialized package.json
 * contents for the package that is about to be installed.
 * The `context` parameter provides a log() function.
 * The return value is the updated object.
 */
function readPackage(packageJson, context) {

  // // The karma types have a missing dependency on typings from the log4js package.
  // if (packageJson.name === '@types/karma') {
  //  context.log('Fixed up dependencies for @types/karma');
  //  packageJson.dependencies['log4js'] = '0.6.38';
  // }

  if (packageJson.name === 'rollup-plugin-dts-bundle-generator') {
    const { "dts-bundle-generator": dtsBundleGeneratorVersion, ...restDependencies } = packageJson.dependencies;
    if (dtsBundleGeneratorVersion !== undefined) {
      packageJson.dependencies = restDependencies;
      const peerDependencyVersion = `>=${dtsBundleGeneratorVersion.replace(/^.*?(\d+(?:\.\d){0,2}.*)$/gu, "$1")}`
      packageJson.peerDependencies["dts-bundle-generator"] = peerDependencyVersion;
      context.log(`rollup-plugin-dts-bundle-generator: switching to peer dependency for dts-bundle-generator (${peerDependencyVersion})`);
    }
  }

  if (packageJson.name === 'eslint-plugin-sonarjs') {
    packageJson.peerDependencies["eslint"] = ">=8.56.0";
    packageJson.peerDependencies["@typescript-eslint/eslint-plugin"] = ">=7.0.0";
    packageJson.peerDependencies["@typescript-eslint/parser"] = ">=7.0.0";
    packageJson.peerDependencies["@typescript-eslint/utils"] = ">=7.0.0";
  }

  return packageJson;
}
