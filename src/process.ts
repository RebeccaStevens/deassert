import assert from "node:assert/strict";

import type * as acorn from "acorn";
import type MagicString from "magic-string";

import { preprocess } from "./preprocessor";
import {
  isExpression,
  isExpressionStatement,
  isIdentifier,
  isImportDeclaration,
  isLogicalExpression,
  isSequenceExpression,
} from "./type-guards";
import {
  type ReadonlyNodesToRemove,
  type ReadonlyScope,
  type ReadonlyScopeToIdentifiersToRemoveMap,
  type Scope,
} from "./types";

export function process(
  ast: Readonly<acorn.Node>,
  code: MagicString,
  modules: ReadonlyArray<string>,
) {
  const [rootScope, nodesToRemove, scopeToIdentifiersToRemoveMap] = preprocess(
    ast,
    modules,
  );
  const removedNodes = new Set<Readonly<acorn.Node>>();

  const stack: Scope[] = [rootScope];

  do {
    const scope =
      stack.pop() ?? assert.fail("stack is empty (or contains undefined).");

    switch (scope.node.type) {
      case "CallExpression": {
        handleCallExpression(
          code,
          removedNodes,
          scope as Scope<acorn.CallExpression>,
          scopeToIdentifiersToRemoveMap,
        );
        break;
      }

      case "ImportDeclaration": {
        handleImportDeclaration(
          code,
          removedNodes,
          scope as Scope<acorn.ImportDeclaration>,
          nodesToRemove,
        );
        break;
      }
    }

    if (scope.children !== undefined) {
      stack.push(...scope.children.values());
    }
  } while (stack.length > 0);
}

function handleCallExpression(
  code: MagicString,
  removedNodes: Set<Readonly<acorn.Node>>,
  scope: ReadonlyScope<acorn.CallExpression>,
  scopeToIdentifiersToRemoveMap: ReadonlyScopeToIdentifiersToRemoveMap,
) {
  if (isRemoved(removedNodes, scope)) {
    return;
  }

  switch (scope.node.callee.type) {
    case "Identifier": {
      if (
        shouldRemoveIdentifier(
          scopeToIdentifiersToRemoveMap,
          scope,
          scope.node.callee.name,
        )
      ) {
        removeNodeSmart(code, removedNodes, scope);
      }
      return;
    }

    case "MemberExpression": {
      if (
        isIdentifier(scope.node.callee.object) &&
        shouldRemoveIdentifier(
          scopeToIdentifiersToRemoveMap,
          scope,
          scope.node.callee.object.name,
        )
      ) {
        removeNodeSmart(code, removedNodes, scope);
      }
    }
  }
}

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

function isRemoved(
  removedNodes: ReadonlySet<Readonly<acorn.Node>>,
  scope: ReadonlyScope,
) {
  let m_s: ReadonlyScope | null = scope;
  do {
    if (removedNodes.has(m_s.node)) {
      return true;
    }
    m_s = m_s.parent;
  } while (m_s !== null);

  return false;
}

function removeNodeSmart(
  code: MagicString,
  removedNodes: Set<Readonly<acorn.Node>>,
  scope: ReadonlyScope,
) {
  if (isImportDeclaration(scope.node)) {
    return void removeNode(code, removedNodes, scope.node);
  }

  if (isExpressionStatement(scope.parent?.node)) {
    // It's not always safe to remove the expression statement so turn it into an empty statement.
    return void replaceNode(code, removedNodes, scope.parent.node, ";");
  }

  if (
    isLogicalExpression(scope.parent?.node) &&
    scope.parent.node.right === scope.node
  ) {
    return void replaceNodeWithChild(
      code,
      removedNodes,
      scope.parent.node,
      scope.parent.node.left,
    );
  }

  if (isSequenceExpression(scope.parent?.node)) {
    assert(isExpression(scope.node));
    const index = scope.parent.node.expressions.indexOf(scope.node);
    assert(index >= 0);
    if (index !== scope.parent.node.expressions.length - 1) {
      const nextExpression = scope.parent.node.expressions[index + 1];
      assert(nextExpression !== undefined);
      return void removeNode(
        code,
        removedNodes,
        scope.node,
        scope.node.start,
        nextExpression.start,
      );
    }
  }

  assert.fail(`Potentially unsafe node removal - ${scope.node.type}`);

  /* v8 ignore next 6 */
  // @ts-expect-error Unreachable code.
  console.error(
    `Potentially unsafe node removal - ${scope.node.type}. Please report this issue.`,
  );
  // @ts-expect-error Unreachable code.
  return void removeNode(code, removedNodes, scope.node);
}

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

function replaceNodeWithChild(
  code: MagicString,
  removedNodes: Set<Readonly<acorn.Node>>,
  node: Readonly<acorn.Node>,
  child: Readonly<acorn.Node>,
) {
  removedNodes.add(node);
  code.remove(node.start, child.start);
  code.remove(child.end, node.end);
}

function shouldRemoveIdentifier(
  scopeToIdentifiersToRemoveMap: ReadonlyScopeToIdentifiersToRemoveMap,
  scope: ReadonlyScope,
  name: string,
) {
  if (scopeToIdentifiersToRemoveMap.get(scope)?.includes(name) === true) {
    return true;
  }
  if (scope.identifiers?.includes(name) !== true && scope.parent !== null) {
    return shouldRemoveIdentifier(
      scopeToIdentifiersToRemoveMap,
      scope.parent,
      name,
    );
  }
  return false;
}
