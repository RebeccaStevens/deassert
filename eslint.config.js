// @ts-check
import rsEslint from "@rebeccastevens/eslint-config";

/** @type {Promise<import("eslint").Linter.Config[]>} */
const config = rsEslint(
  {
    projectRoot: import.meta.dirname,
    mode: "library",
    typescript: {
      unsafe: "off",
    },
    formatters: true,
    functional: "none",
    jsonc: true,
    markdown: true,
    stylistic: true,
    yaml: true,
  },
  {
    rules: {
      "ts/ban-ts-comment": "off",
      "import/extensions": "off",
    },
  },
  {
    files: ["packages/cli/src/**/*"],
    rules: {
      "no-console": "off",
    },
  },
);

export default config;
