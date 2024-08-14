/* eslint-disable jsdoc/require-jsdoc -- Trivial */

import type * as acorn from "acorn";

export function isIdentifier(node: acorn.Node | undefined | null): node is acorn.Identifier {
  return node?.type === "Identifier";
}

export function isLogicalExpression(node: acorn.Node | undefined | null): node is acorn.LogicalExpression {
  return node?.type === "LogicalExpression";
}

export function isSequenceExpression(node: acorn.Node | undefined | null): node is acorn.SequenceExpression {
  return node?.type === "SequenceExpression";
}

export function isConditionalExpression(node: acorn.Node | undefined | null): node is acorn.ConditionalExpression {
  return node?.type === "ConditionalExpression";
}

export function isExpression(node: acorn.Node | undefined | null): node is acorn.Expression {
  switch (node?.type) {
    case "Identifier":
    case "Literal":
    case "ThisExpression":
    case "ArrayExpression":
    case "ObjectExpression":
    case "FunctionExpression":
    case "UnaryExpression":
    case "UpdateExpression":
    case "BinaryExpression":
    case "AssignmentExpression":
    case "LogicalExpression":
    case "MemberExpression":
    case "ConditionalExpression":
    case "CallExpression":
    case "NewExpression":
    case "SequenceExpression":
    case "ArrowFunctionExpression":
    case "YieldExpression":
    case "TemplateLiteral":
    case "TaggedTemplateExpression":
    case "ClassExpression":
    case "MetaProperty":
    case "AwaitExpression":
    case "ChainExpression":
    case "ImportExpression":
    case "ParenthesizedExpression": {
      return true;
    }
    default: {
      return false;
    }
  }
}

export function isExpressionStatement(node: acorn.Node | undefined | null): node is acorn.ExpressionStatement {
  return node?.type === "ExpressionStatement";
}

export function isImportDeclaration(node: acorn.Node | undefined | null): node is acorn.ImportDeclaration {
  return node?.type === "ImportDeclaration";
}
