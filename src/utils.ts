/**
 * Checks if the given element is not null.
 *
 * @param element - The element to check.
 * @returns True if element is not null.
 */
export function isNotNull<T>(element: T | null): element is T {
  return element !== null;
}
