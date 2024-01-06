<div align="center">

# Deassert

[![npm version](https://img.shields.io/npm/v/deassert.svg)](https://www.npmjs.com/package/deassert)
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

### Rollup Plugin

```js
// rollup.config.js
import { rollupPlugin as deassert } from "deassert";

const isProduction = process.env.NODE_ENV === "production";

export default {
  // ...
  plugins: isProduction
    ? [
        // ...
        deassert({
          include: ["**/*.ts"], // If using TypeScript, be sure to include this config option. Otherwise remove it.
        }),
      ]
    : [
        // ...
      ],
};

```

### CLI

```sh
npx deassert myfile.js > myfile.deasserted.js
```

Note: Options cannot be provided via the CLI.

### API

```js
import deassert from "deassert";

const result = deassert(code, options);
console.log(result.code);
```

#### Options

##### `modules`

An array of modules to be considered assert modules.
These modules will be what is stripped out.

###### default

```js
["assert", "assert/strict", "node:assert", "node:assert/strict"]
```

##### `sourceMap`

Determines if a source map should be generated.

[MagicString](https://www.npmjs.com/package/magic-string) source map options can be passed in.

###### default

```jsonc
false
```

If `true` is passed, then these options will be used:

```jsonc
{
  "hires": true,
}
```

##### `ast`

The AST of the code that is passed in.

Providing this is optional, but if you have the AST already then we can use that instead of generating our own.

###### default

```jsonc
undefined
```

##### `acornOptions`

The options provided to [Acorn](https://www.npmjs.com/package/acorn) to parse the input code. These are not used if an AST is provided.

###### default

```jsonc
{
  "sourceType": "module",
  "ecmaVersion": "latest",
}
```

## Example

Given the following code that uses assertion calls to enforce known invariants,
some of which may be expensive (line 11):

```js
import { ok as assert, fail as assertNever, AssertionError } from "node:assert/strict";

const stack = [{ type: "foo", children: [ /* ... */] }];
const result = [];

try {
  do {
    const element = stack.pop() ?? assertNever("stack is empty (or contains undefined).");

    switch(element.type) {
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
}
catch (error) {
  assert(error instanceof Error, "Unexpected Error.");
  assert(!(error instanceof AssertionError), error);

  console.error(error);
}
```

This library will transform the code into essentially the following:

```js
const stack = [{ type: "foo", children: [ /* ... */] }];
const result = [];

try {
  do {
    const element = stack.pop();

    switch(element.type) {
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
}
catch (error) {
  console.error(error);
}
```

## Similar Projects

This project was inspired by [Unassert](https://github.com/unassert-js/unassert)
which has the same objective as this project.

While unassert works by modifying the inputted AST, this library
works directly on the inputted code.
