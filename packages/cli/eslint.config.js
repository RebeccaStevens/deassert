// @ts-check
import rsEslint from "@rebeccastevens/eslint-config";

export default rsEslint(
  {
    projectRoot: import.meta.dirname,
    mode: "library",
    typescript: {
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
    rules: {
      "no-console": "off",
    },
  },
  {
    files: ["rollup.config.js"],
    rules: {
      "ts/no-unsafe-argument": "off",
      "ts/no-unsafe-assignment": "off",
      "ts/no-unsafe-member-access": "off",
      "ts/no-explicit-any": "off",
    },
  },
);
