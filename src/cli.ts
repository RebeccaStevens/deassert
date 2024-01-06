import assert from "node:assert/strict";
import fsp from "node:fs/promises";

import deassert from "deassert";

if (process.argv.length === 2) {
  console.log("Usage: deassert <file>");
  process.exitCode = 1;
  throw new Error("No file specified");
}

if (process.argv.length > 3) {
  process.exitCode = 2;
  throw new Error("Too many arguments");
}

const file = process.argv[2] ?? assert.fail();

const fileContent = await fsp.readFile(file, "utf8");
const { code } = deassert(fileContent);

console.log(code);
