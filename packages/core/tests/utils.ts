import { expect } from "vitest";

/**
 * Test that the code is the same as the expected code.
 */
export function compareCode(actual: string, expected: string): void {
  expect(strip(actual)).toBe(strip(expected));
}

function strip(code: string) {
  return code
    .replace(/^\n+/u, "")
    .replace(/\n+$/u, "")
    .replaceAll(/(?:\s+\n)+/gu, "\n");
}
