import type * as acorn from "acorn";

export type ScopeMap = Map<Readonly<acorn.Node>, Scope>;

export type ReadonlyScopeMap = ReadonlyMap<
  Readonly<acorn.Node>,
  Readonly<Scope>
>;

export type Scope<T extends acorn.Node = acorn.Node> = {
  node: Readonly<T>;
  parent: Scope | null;
  children?: ScopeMap;
  identifiers?: string[];
};

export type ReadonlyScope<T extends acorn.Node = acorn.Node> = {
  readonly node: Readonly<T>;
  readonly parent: ReadonlyScope | null;
  readonly children?: ReadonlyScopeMap;
  readonly identifiers?: ReadonlyArray<string>;
};

export type ScopeToIdentifiersToRemoveMap = Map<ReadonlyScope, string[]>;

export type ReadonlyScopeToIdentifiersToRemoveMap = ReadonlyMap<
  ReadonlyScope,
  ReadonlyArray<string>
>;

export type NodesToRemove = Array<Readonly<acorn.Node>>;

export type ReadonlyNodesToRemove = ReadonlyArray<Readonly<acorn.Node>>;
