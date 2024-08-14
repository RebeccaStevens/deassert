<div align="center">

# Deassert Mono Repo

[![CI](https://github.com/RebeccaStevens/deassert/actions/workflows/release.yml/badge.svg)](https://github.com/RebeccaStevens/deassert/actions/workflows/release.yml)
[![Coverage Status](https://codecov.io/gh/RebeccaStevens/deassert/branch/main/graph/badge.svg?token=MVpR1oAbIT)](https://codecov.io/gh/RebeccaStevens/deassert)\
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![GitHub Discussions](https://img.shields.io/github/discussions/RebeccaStevens/deassert?style=flat-square)](https://github.com/RebeccaStevens/deassert/discussions)
[![BSD 3 Clause license](https://img.shields.io/github/license/RebeccaStevens/deassert.svg?style=flat-square)](https://opensource.org/licenses/BSD-3-Clause)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)

Allows for [programming with
assertions](<https://en.wikipedia.org/wiki/Assertion_(software_development)>)/[invariant-based
programming](https://en.wikipedia.org/wiki/Invariant-based_programming) during
development without slowing down production.

</div>

## Donate

[Any donations would be much appreciated](./DONATIONS.md). 😄

### Enterprise Users

`deassert` is available as part of the [Tidelift Subscription](https://tidelift.com/funding/github/npm/deassert).

Tidelift is working with the maintainers of `deassert` and a growing network of open source maintainers
to ensure your open source software supply chain meets enterprise standards now and into the future.
[Learn more.](https://tidelift.com/subscription/pkg/npm-deassert?utm_source=npm-deassert&utm_medium=referral&utm_campaign=enterprise&utm_term=repo)

## Installation

```sh
# Install with npm
npm install -D deassert

# Install with pnpm
pnpm add -D deassert

# Install with yarn
yarn add -D deassert

# Install with bun
bun add -D deassert
```

## Thinking about Invariants

Invariant checks in your code should be thought of as a way of saying:

> If this check fails, something is very wrong elsewhere in my code.

Do not try to recover from Assertion Errors. If your error is recoverable, use a different type of error object.

## Usage

You probably don't want to use this library in your development builds.
It's designed to be used in your production builds.

### Packages

- [JS API](./packages/core/) [![npm version](https://img.shields.io/npm/v/deassert.svg)](https://www.npmjs.com/package/deassert)
- [CLI](./packages/cli/) [![npm version](https://img.shields.io/npm/v/deassert-cli.svg)](https://www.npmjs.com/package/deassert-cli)
- [Rollup Plugin](./packages/rollup-plugin/) [![npm version](https://img.shields.io/npm/v/rollup-plugin-deassert.svg)](https://www.npmjs.com/package/rollup-plugin-deassert)
- [Webpack Loader](./packages/webpack-loader/) [![npm version](https://img.shields.io/npm/v/deassert-loader.svg)](https://www.npmjs.com/package/deassert-loader)

## Example

Given the following code that uses assertion calls to enforce known invariants,
some of which may be expensive (line 25):

```js
import { AssertionError, ok as assert, fail as assertNever } from "node:assert/strict";

const stack = [
  {
    type: "foo",
    children: [
      /* ... */
    ],
  },
];
const result = [];

try {
  do {
    const element = stack.pop() ?? assertNever("stack is empty (or contains undefined).");

    switch (element.type) {
      case "foo": {
        assert(children.every(isExpectedType), "unexpected child type.");
        stack.push(...children);
        break;
      }

      case "bar": {
        assert(element.children.length === 0, "bar elements should not have children.");
        result.push(element.data);
        break;
      }

      case "baz": {
        throw new Error("Not Implemented yet.");
      }

      default: {
        assertNever(`Unexpected type: "${element.type}"`);
      }
    }
  } while (stack.length > 0);

  console.log((assert(result.length > 0), result));
} catch (error) {
  assert(error instanceof Error, "Unexpected Error.");
  assert(!(error instanceof AssertionError), error);

  console.error(error);
}
```

This library will transform the code into essentially the following:

```js
const stack = [
  {
    type: "foo",
    children: [
      /* ... */
    ],
  },
];
const result = [];

try {
  do {
    const element = stack.pop();

    switch (element.type) {
      case "foo": {
        stack.push(...children);
        break;
      }

      case "bar": {
        result.push(element.data);
        break;
      }

      case "baz": {
        throw new Error("Not Implemented yet.");
      }
    }
  } while (stack.length > 0);

  console.log(result);
} catch (error) {
  console.error(error);
}
```

## Similar Projects

This project was inspired by [Unassert](https://github.com/unassert-js/unassert)
which has the same objective as this project.

While unassert works by modifying the inputted AST, this library
works directly on the inputted code.
