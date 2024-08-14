<div align="center">

# Rollup Plugin Deassert

[![npm version](https://img.shields.io/npm/v/deassert.svg)](https://www.npmjs.com/package/rollup-plugin-deassert)
[![CI](https://github.com/RebeccaStevens/deassert/actions/workflows/release.yml/badge.svg)](https://github.com/RebeccaStevens/deassert/actions/workflows/release.yml)
[![Coverage Status](https://codecov.io/gh/RebeccaStevens/deassert/branch/main/graph/badge.svg?token=MVpR1oAbIT)](https://codecov.io/gh/RebeccaStevens/deassert)\
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![GitHub Discussions](https://img.shields.io/github/discussions/RebeccaStevens/deassert?style=flat-square)](https://github.com/RebeccaStevens/deassert/discussions)
[![BSD 3 Clause license](https://img.shields.io/github/license/RebeccaStevens/deassert.svg?style=flat-square)](https://opensource.org/licenses/BSD-3-Clause)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)

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
npm install -D rollup-plugin-deassert

# Install with pnpm
pnpm add -D rollup-plugin-deassert

# Install with yarn
yarn add -D rollup-plugin-deassert

# Install with bun
bun add -D rollup-plugin-deassert
```

## Usage

You probably don't want to use this library in your development builds. It's designed to be used in your production
builds.

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
