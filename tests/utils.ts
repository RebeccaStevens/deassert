import { expect } from "vitest";

export function compareCode(actual: string, expected: string) {
  expect(strip(actual)).toBe(strip(expected));
}

function strip(code: string) {
  return code
    .replace(/^\n+/u, "")
    .replace(/\n+$/u, "")
    .replaceAll(/(?:\s+\n)+/gu, "\n");
}
