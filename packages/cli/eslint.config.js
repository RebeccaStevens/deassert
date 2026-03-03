// @ts-check
import rsEslint from "@rebeccastevens/eslint-config";

/**
 * @type {Promise<import("eslint").Linter.Config[]>}
 */
const config = rsEslint(
  {
    projectRoot: import.meta.dirname,
    mode: "library",
    typescript: {
      unsafe: "off",
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.js"],
          defaultProject: "./tsconfig.json",
        },
      },
    },
    formatters: true,
    functional: false,
    jsonc: true,
    markdown: true,
    sonar: false,
    stylistic: true,
    test: false,
    yaml: true,
    ignoresFiles: ["../../.gitignore"],
  },
  {
    files: ["rollup.config.ts"],
    rules: {
      "ts/no-explicit-any": "off",
    },
  },
  {
    rules: {
      "no-console": "off",
    },
  },
);

export default config;
