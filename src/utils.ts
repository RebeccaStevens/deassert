import { fail as assertNever } from "node:assert/strict";

/**
 * Checks if the given element is not null.
 *
 * @param element - The element to check.
 * @returns True if element is not null.
 */
export function isNotNull<T>(element: T | null): element is T {
  return element !== null;
}

/**
 * Log the message and fail if not in production.
 *
 * @param message - The message to log.
 */
export function assertNeverAndLog(message: string): never {
  console.error(
    `Deassert: ${message}\nPlease report this issue at https://github.com/RebeccaStevens/deassert/issues`,
  );
  assertNever();
}
