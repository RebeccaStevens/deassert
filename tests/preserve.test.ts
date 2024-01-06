import dedent from "dedent";
import MagicString from "magic-string";
import { describe, it } from "vitest";

import deassert from "../src";

import { compareCode } from "./utils";

describe("preserve", () => {
  it("comments", () => {
    const fixture = dedent`
      import assert from "node:assert/strict";

      // a comment
      assert(true); // do assertion
      // another comment
      console.log("foo"); // print foo
      // yet another comment
    `;

    const expected = dedent`
      // a comment
      ; // do assertion
      // another comment
      console.log("foo"); // print foo
      // yet another comment
    `;

    const code = new MagicString(fixture);

    deassert(code);
    compareCode(code.toString(), expected);
  });

  it("non-assertion code", () => {
    const fixture = dedent`
      import foo from "./foo";

      foo(1, 2, 3);
    `;
    const expected = fixture;

    const code = new MagicString(fixture);

    deassert(code);
    compareCode(code.toString(), expected);
  });
});
