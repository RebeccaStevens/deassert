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

[Any donations would be much appreciated](../../DONATIONS.md). 😄

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

## Usage

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
["assert", "assert/strict", "node:assert", "node:assert/strict"];
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
