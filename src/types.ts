import type * as acorn from "acorn";

/**
 * A Map that maps AST nodes to their scope information.
 */
export type ScopeMap = Map<Readonly<acorn.Node>, Scope>;

/**
 * A readonly version of {@link ScopeMap}.
 */
export type ReadonlyScopeMap = ReadonlyMap<
  Readonly<acorn.Node>,
  Readonly<Scope>
>;

/**
 * Scope information for a node.
 */
export type Scope<T extends acorn.Node = acorn.Node> = {
  /**
   * The node this scope is for.
   */
  node: Readonly<T>;

  /**
   * The parent scope.
   */
  parent: Scope | null;

  /**
   * Child scope nodes.
   */
  children?: ScopeMap;

  /**
   * The identifiers defined in this scope.
   */
  identifiers?: string[];
};

/**
 * A readonly version of {@link Scope}.
 */
export type ReadonlyScope<T extends acorn.Node = acorn.Node> = {
  readonly node: Readonly<T>;
  readonly parent: ReadonlyScope | null;
  readonly children?: ReadonlyScopeMap;
  readonly identifiers?: ReadonlyArray<string>;
};

/**
 * A map from scopes to identifier names to remove from that scope.
 */
export type ScopeToIdentifiersToRemoveMap = Map<ReadonlyScope, string[]>;

/**
 * A readonly version of {@link ScopeToIdentifiersToRemoveMap}.
 */
export type ReadonlyScopeToIdentifiersToRemoveMap = ReadonlyMap<
  ReadonlyScope,
  ReadonlyArray<string>
>;

/**
 * An array of AST nodes to remove.
 */
export type NodesToRemove = Array<Readonly<acorn.Node>>;

/**
 * A readonly version of {@link NodesToRemove}.
 */
export type ReadonlyNodesToRemove = ReadonlyArray<Readonly<acorn.Node>>;
