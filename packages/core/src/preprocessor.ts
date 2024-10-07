import { ok as assert, fail as assertNever } from "node:assert/strict";

import type * as acorn from "acorn";
import { type AncestorVisitors, ancestor as ancestorWalk } from "acorn-walk";

import type { NodesToRemove, Scope, ScopeToIdentifiersToRemoveMap } from "./types";
import { assertNeverAndLog, isNotNull } from "./utils";

/**
 * Walk the ast to gather all the infomation we need to process the code.
 */
export function preprocess(
  ast: Readonly<acorn.Node>,
  modules: ReadonlyArray<string>,
): [Scope, NodesToRemove, ScopeToIdentifiersToRemoveMap] {
  const rootScope = createScope(ast, null);
  const scopeToIdentifiersToRemoveMap: ScopeToIdentifiersToRemoveMap = new Map();
  const nodesToRemove: NodesToRemove = [];

  const isAssertionModuleName = (node: Readonly<acorn.Literal>) =>
    typeof node.value === "string" && modules.includes(node.value);

  ancestorWalk(ast, createVisitor(rootScope, nodesToRemove, scopeToIdentifiersToRemoveMap, isAssertionModuleName));

  return [rootScope, nodesToRemove, scopeToIdentifiersToRemoveMap];
}

/**
 * Create the visitor that will walk the ast.
 */
function createVisitor<State>(
  mut_rootScope: Scope,
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
    registerNode(mut_rootScope, ancestors);
  }

  /**
   * Handles traversing a FunctionDeclaration AST node to
   * register the function name identifier to the current scope.
   */
  function FunctionDeclaration(
    node: Readonly<acorn.FunctionDeclaration | acorn.AnonymousFunctionDeclaration>,
    state: State,
    ancestors: ReadonlyArray<Readonly<acorn.Node>>,
  ) {
    const scope = registerNode(mut_rootScope, ancestors);

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
    const scope = registerNode(mut_rootScope, ancestors);
    const identifiersToRemove = ensureIdentifiersToRemove(scopeToIdentifiersToRemoveMap, scope);

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
    const scope = registerNode(mut_rootScope, ancestors);
    const stack: Array<acorn.Pattern | acorn.AssignmentProperty> = node.declarations.map((declarator) => declarator.id);

    do {
      const element = stack.pop() ?? assertNever("stack is empty (or contains undefined).");

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
          // Shouldn't happen... probably. Needs code example if it can.
          assertNeverAndLog(`Unexpected variable declarator type "${element.type}"`);
        }
      }
    } while (stack.length > 0);
  }
}

/**
 * Adds identifiers to the given scope.
 */
function addIdentifiers(scope: Scope, identifiers: string[]): asserts scope is Scope & { identifiers: string[] } {
  if (scope.identifiers === undefined) {
    scope.identifiers = identifiers;
    return;
  }

  scope.identifiers.push(...identifiers);
}

/**
 * Gets the identifiers to remove for the given scope, creating it if needed.
 */
function ensureIdentifiersToRemove(scopeToIdentifiersToRemoveMap: ScopeToIdentifiersToRemoveMap, mut_scope: Scope) {
  const toRemove = scopeToIdentifiersToRemoveMap.get(mut_scope);
  if (toRemove !== undefined) {
    return toRemove;
  }

  const newToRemove: string[] = [];
  scopeToIdentifiersToRemoveMap.set(mut_scope, newToRemove);
  return newToRemove;
}

/**
 * Registers a node by ensuring that its scope exists.
 *
 * @returns The scope this node is in.
 */
function registerNode(mut_rootScope: Scope, ancestors: ReadonlyArray<Readonly<acorn.Node>>) {
  assert(ancestors.length > 0);

  let mut_scope = mut_rootScope;
  let mut_i = 1;

  do {
    mut_scope = ensureScope(mut_scope, ancestors[mut_i] ?? assertNever());
    mut_i++;
  } while (mut_i < ancestors.length);

  assert(mut_scope.parent !== null);

  return mut_scope.parent;
}

/**
 * Ensures that a scope exists for the given node, creating it if needed.
 *
 * @returns The scope for the node.
 */
function ensureScope(mut_parentScope: Scope, node: Readonly<acorn.Node>) {
  if (mut_parentScope.children === undefined) {
    mut_parentScope.children = new Map();
  } else {
    const scope = mut_parentScope.children.get(node);
    if (scope !== undefined) {
      return scope;
    }
  }

  const newScope: Scope = createScope(node, mut_parentScope);
  mut_parentScope.children.set(node, newScope);
  return newScope;
}

/**
 * Creates a new scope for the given AST node.
 */
function createScope(node: Readonly<acorn.Node>, parentScope: Scope | null): Scope {
  return {
    node,
    parent: parentScope ?? null,
  };
}
