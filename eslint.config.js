// @ts-check
import rsEslint from "@rebeccastevens/eslint-config";

export default rsEslint(
  {
    projectRoot: import.meta.dirname,
    mode: "library",
    typescript: true,
    formatters: true,
    functional: false,
    jsonc: true,
    markdown: true,
    stylistic: true,
    yaml: true,
  },
  {
    files: ["src/cli.ts"],
    rules: {
      "no-console": "off",
    },
  },
);
