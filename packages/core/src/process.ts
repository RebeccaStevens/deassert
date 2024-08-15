import { ok as assert, fail as assertNever } from "node:assert/strict";

import type * as acorn from "acorn";
import type MagicString from "magic-string";

import { preprocess } from "./preprocessor";
import {
  isConditionalExpression,
  isExpression,
  isExpressionStatement,
  isIdentifier,
  isImportDeclaration,
  isLogicalExpression,
  isSequenceExpression,
} from "./type-guards";
import type { ReadonlyNodesToRemove, ReadonlyScope, ReadonlyScopeToIdentifiersToRemoveMap, Scope } from "./types";
import { assertNeverAndLog } from "./utils";

/**
 * Processes the provided AST to remove assert statements and assertion imports.
 *
 * @param ast - The AST to process.
 * @param code - The code corresponding to the AST, as a MagicString instance.
 * @param modules - A list of assertion modules.
 */
export function process(ast: Readonly<acorn.Node>, code: MagicString, modules: ReadonlyArray<string>): void {
  const [rootScope, nodesToRemove, scopeToIdentifiersToRemoveMap] = preprocess(ast, modules);
  const removedNodes = new Set<Readonly<acorn.Node>>();

  const stack: Scope[] = [rootScope];

  do {
    const scope = stack.pop() ?? assertNever("stack is empty (or contains undefined).");

    switch (scope.node.type) {
      case "CallExpression": {
        handleCallExpression(code, removedNodes, scope as Scope<acorn.CallExpression>, scopeToIdentifiersToRemoveMap);
        break;
      }

      case "ImportDeclaration": {
        handleImportDeclaration(code, removedNodes, scope as Scope<acorn.ImportDeclaration>, nodesToRemove);
        break;
      }
    }

    if (scope.children !== undefined) {
      stack.push(...scope.children.values());
    }
  } while (stack.length > 0);
}

/**
 * Process a call expression in the code.
 */
function handleCallExpression(
  code: MagicString,
  removedNodes: Set<Readonly<acorn.Node>>,
  scope: ReadonlyScope<acorn.CallExpression>,
  scopeToIdentifiersToRemoveMap: ReadonlyScopeToIdentifiersToRemoveMap,
) {
  if (isRemoved(removedNodes, scope)) {
    return;
  }

  // eslint-disable-next-line ts/switch-exhaustiveness-check -- Only check types we care about.
  switch (scope.node.callee.type) {
    case "Identifier": {
      if (shouldRemoveIdentifier(scopeToIdentifiersToRemoveMap, scope, scope.node.callee.name)) {
        removeNodeSmart(code, removedNodes, scope);
      }
      return;
    }

    case "MemberExpression": {
      if (
        isIdentifier(scope.node.callee.object) &&
        shouldRemoveIdentifier(scopeToIdentifiersToRemoveMap, scope, scope.node.callee.object.name)
      ) {
        removeNodeSmart(code, removedNodes, scope);
      }
    }
  }
}

/**
 * Process an import declaration in the code.
 */
function handleImportDeclaration(
  code: MagicString,
  removedNodes: Set<Readonly<acorn.Node>>,
  scope: ReadonlyScope<acorn.ImportDeclaration>,
  nodesToRemove: ReadonlyNodesToRemove,
) {
  if (isRemoved(removedNodes, scope)) {
    return;
  }

  if (!nodesToRemove.includes(scope.node)) {
    return;
  }

  removeNodeSmart(code, removedNodes, scope);
}

/**
 * Returns true if the node for the given scope has been removed.
 */
function isRemoved(removedNodes: ReadonlySet<Readonly<acorn.Node>>, scope: ReadonlyScope) {
  let m_s: ReadonlyScope | null = scope;
  do {
    if (removedNodes.has(m_s.node)) {
      return true;
    }
    m_s = m_s.parent;
  } while (m_s !== null);

  return false;
}

/**
 * Effectively remove the node for the given scope.
 *
 * It's parent maybe removed or it maybe replaced.
 */
function removeNodeSmart(code: MagicString, removedNodes: Set<Readonly<acorn.Node>>, scope: ReadonlyScope) {
  if (isImportDeclaration(scope.node)) {
    return void removeNode(code, removedNodes, scope.node);
  }

  if (isExpressionStatement(scope.parent?.node)) {
    // It's not always safe to remove the expression statement so turn it into an empty statement.
    return void replaceNode(code, removedNodes, scope.parent.node, ";");
  }

  if (isLogicalExpression(scope.parent?.node) && scope.parent.node.right === scope.node) {
    return void replaceNodeWithChild(code, removedNodes, scope.parent.node, scope.parent.node.left);
  }

  if (isSequenceExpression(scope.parent?.node)) {
    assert(isExpression(scope.node));
    const index = scope.parent.node.expressions.indexOf(scope.node);
    assert(index >= 0);
    if (index !== scope.parent.node.expressions.length - 1) {
      const nextExpression = scope.parent.node.expressions[index + 1];
      assert(nextExpression !== undefined);
      return void removeNode(code, removedNodes, scope.node, scope.node.start, nextExpression.start);
    }
  }

  if (isConditionalExpression(scope.parent?.node)) {
    if (scope.parent.node.consequent === scope.node) {
      code.appendLeft(scope.parent.node.test.start, "((");
      code.appendRight(scope.parent.node.test.end, ") && false)");

      return void replaceNode(code, removedNodes, scope.parent.node.consequent, "undefined");
    }

    code.appendLeft(scope.parent.node.test.start, "((");
    code.appendRight(scope.parent.node.test.end, ") || true)");

    return void replaceNode(code, removedNodes, scope.parent.node.alternate, "undefined");
  }

  /* v8 ignore next 2 */
  removeNode(code, removedNodes, scope.node);
  assertNeverAndLog(`Potentially unsafe node removal - ${scope.node.type}.`);
}

/**
 * Remove the given node.
 *
 * @param code - The code to remove the node from.
 * @param removedNodes - A list of nodes that have been removed. The node will be added to this list.
 * @param node - The node to remove.
 * @param start - The start index within the code to remove.
 * @param end - The end index within the code to remove.
 */
function removeNode(
  code: MagicString,
  removedNodes: Set<Readonly<acorn.Node>>,
  node: Readonly<acorn.Node>,
  start?: number,
  end?: number,
) {
  removedNodes.add(node);
  code.remove(start ?? node.start, end ?? node.end);
}

/**
 * Replace a node with the given replacement.
 *
 * @param code - The code to remove the node from.
 * @param removedNodes - A list of nodes that have been removed. The node will be added to this list.
 * @param node - The node to remove.
 * @param replacement - What the node should be replaced with.
 * @param start - The start index within the code to remove.
 * @param end - The end index within the code to remove.
 */
function replaceNode(
  code: MagicString,
  removedNodes: Set<Readonly<acorn.Node>>,
  node: Readonly<acorn.Node>,
  replacement: string,
  start?: number,
  end?: number,
) {
  removedNodes.add(node);
  code.update(start ?? node.start, end ?? node.end, replacement);
}

/**
 * Remove a node and replace it with one of it children.
 *
 * Effectively, unwrap the child.
 *
 * @param code - The code to remove the node from.
 * @param removedNodes - A list of nodes that have been removed. The node will be added to this list.
 * @param node - The node to remove.
 * @param child - The child node to replace the node with.
 */
function replaceNodeWithChild(
  code: MagicString,
  removedNodes: Set<Readonly<acorn.Node>>,
  node: Readonly<acorn.Node>,
  child: Readonly<acorn.Node>,
) {
  assert(node.start <= child.start && node.end >= child.end, "Child node is not a child of the node.");

  removedNodes.add(node);
  code.remove(node.start, child.start);
  code.remove(child.end, node.end);
}

/**
 * Checks if an identifier is flaged for removal.
 */
function shouldRemoveIdentifier(
  scopeToIdentifiersToRemoveMap: ReadonlyScopeToIdentifiersToRemoveMap,
  scope: ReadonlyScope,
  name: string,
) {
  if (scopeToIdentifiersToRemoveMap.get(scope)?.includes(name) === true) {
    return true;
  }
  // If identifier wasn't declared in this scope, check the parent scope.
  if (scope.identifiers?.includes(name) !== true && scope.parent !== null) {
    return shouldRemoveIdentifier(scopeToIdentifiersToRemoveMap, scope.parent, name);
  }
  return false;
}
