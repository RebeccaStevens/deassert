import assert from "node:assert/strict";

import type * as acorn from "acorn";
import { ancestor as ancestorWalk, type AncestorVisitors } from "acorn-walk";

import {
  type NodesToRemove,
  type Scope,
  type ScopeToIdentifiersToRemoveMap,
} from "./types";
import { isNotNull } from "./utils";

export function preprocess(
  ast: Readonly<acorn.Node>,
  modules: ReadonlyArray<string>,
): [Scope, NodesToRemove, ScopeToIdentifiersToRemoveMap] {
  const rootScope = createScope(ast, null);
  const scopeToIdentifiersToRemoveMap: ScopeToIdentifiersToRemoveMap =
    new Map();
  const nodesToRemove: NodesToRemove = [];

  const isAssertionModuleName = (node: Readonly<acorn.Literal>) => {
    return typeof node.value === "string" && modules.includes(node.value);
  };

  ancestorWalk(
    ast,
    createVisitor(
      rootScope,
      nodesToRemove,
      scopeToIdentifiersToRemoveMap,
      isAssertionModuleName,
    ),
  );

  return [rootScope, nodesToRemove, scopeToIdentifiersToRemoveMap];
}

function createVisitor<State>(
  rootScope: Scope,
  nodesToRemove: NodesToRemove,
  scopeToIdentifiersToRemoveMap: ScopeToIdentifiersToRemoveMap,
  isAssertionModuleName: (node: Readonly<acorn.Literal>) => boolean,
): AncestorVisitors<State> {
  return {
    CallExpression,
    FunctionDeclaration,
    ImportDeclaration,
    VariableDeclaration,
  };

  /**
   * Handles traversing a CallExpression AST node to
   * register the node.
   */
  function CallExpression(
    node: Readonly<acorn.CallExpression>,
    state: State,
    ancestors: ReadonlyArray<Readonly<acorn.Node>>,
  ) {
    registerNode(rootScope, ancestors);
  }

  /**
   * Handles traversing a FunctionDeclaration AST node to
   * register the function name identifier to the current scope.
   */
  function FunctionDeclaration(
    node: Readonly<
      acorn.FunctionDeclaration | acorn.AnonymousFunctionDeclaration
    >,
    state: State,
    ancestors: ReadonlyArray<Readonly<acorn.Node>>,
  ) {
    const scope = registerNode(rootScope, ancestors);

    if (node.id !== null) {
      addIdentifiers(scope, [node.id.name]);
    }
  }

  /**
   * Handles traversing an ImportDeclaration AST node to
   * register imported identifiers to the current scope.
   */
  function ImportDeclaration(
    node: Readonly<acorn.ImportDeclaration>,
    state: State,
    ancestors: ReadonlyArray<Readonly<acorn.Node>>,
  ) {
    const scope = registerNode(rootScope, ancestors);
    const identifiersToRemove = ensureIdentifiersToRemove(
      scopeToIdentifiersToRemoveMap,
      scope,
    );

    addIdentifiers(scope, []);

    const assertionModule = isAssertionModuleName(node.source);
    if (assertionModule) {
      nodesToRemove.push(node);
    }

    for (const specifier of node.specifiers) {
      scope.identifiers.push(specifier.local.name);
      if (assertionModule) {
        identifiersToRemove.push(specifier.local.name);
      }
    }
  }

  /**
   * Handles traversing a VariableDeclaration AST node to
   * register variable identifiers to the current scope.
   */
  function VariableDeclaration(
    node: Readonly<acorn.VariableDeclaration>,
    state: State,
    ancestors: ReadonlyArray<Readonly<acorn.Node>>,
  ) {
    const scope = registerNode(rootScope, ancestors);
    const stack: Array<acorn.Pattern | acorn.AssignmentProperty> =
      node.declarations.map((declarator) => declarator.id);

    do {
      const element =
        stack.pop() ?? assert.fail("stack is empty (or contains undefined).");

      switch (element.type) {
        case "Identifier": {
          if (scope.identifiers === undefined) {
            scope.identifiers = [];
          }
          scope.identifiers.push(element.name);
          break;
        }

        case "RestElement": {
          stack.push(element.argument);
          break;
        }

        case "ArrayPattern": {
          stack.push(...element.elements.filter(isNotNull));
          break;
        }

        case "ObjectPattern": {
          stack.push(...element.properties.filter(isNotNull));
          break;
        }

        case "Property": {
          stack.push(element.value);
          break;
        }

        case "AssignmentPattern": {
          stack.push(element.left);
          break;
        }

        default: {
          assert.fail(`Unexpected variable declarator "${element.type}"`); // Shouldn't happen... probably. Needs code example if it can.
        }
      }
    } while (stack.length > 0);
  }
}

function addIdentifiers(
  scope: Scope,
  identifiers: string[],
): asserts scope is Scope & { identifiers: string[] } {
  if (scope.identifiers === undefined) {
    scope.identifiers = identifiers;
    return;
  }

  scope.identifiers.push(...identifiers);
}

function ensureIdentifiersToRemove(
  scopeToIdentifiersToRemoveMap: ScopeToIdentifiersToRemoveMap,
  scope: Scope,
) {
  const toRemove = scopeToIdentifiersToRemoveMap.get(scope);
  if (toRemove !== undefined) {
    return toRemove;
  }

  const newToRemove: string[] = [];
  scopeToIdentifiersToRemoveMap.set(scope, newToRemove);
  return newToRemove;
}

function registerNode(
  rootScope: Scope,
  ancestors: ReadonlyArray<Readonly<acorn.Node>>,
) {
  assert(ancestors.length > 0);

  let m_scope = rootScope;
  let m_i = 1;

  do {
    m_scope = ensureScope(m_scope, ancestors[m_i] ?? assert.fail());
    m_i++;
  } while (m_i < ancestors.length);

  assert(m_scope.parent !== null);

  return m_scope.parent;
}

function ensureScope(parentScope: Scope, node: Readonly<acorn.Node>) {
  if (parentScope.children === undefined) {
    parentScope.children = new Map();
  } else {
    const scope = parentScope.children.get(node);
    if (scope !== undefined) {
      return scope;
    }
  }

  const newScope: Scope = createScope(node, parentScope);
  parentScope.children.set(node, newScope);
  return newScope;
}

function createScope(
  node: Readonly<acorn.Node>,
  parentScope: Scope | null,
): Scope {
  return {
    node,
    parent: parentScope ?? null,
  };
}
