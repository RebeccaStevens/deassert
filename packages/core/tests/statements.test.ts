import dedent from "dedent";
import MagicString from "magic-string";
import { describe, it } from "vitest";

import deassert from "../src";

import { compareCode } from "./utils";

describe("call statements", () => {
  it("removes assertion call statements", () => {
    const fixture = dedent`
      import assert, { ok, fail } from "node:assert/strict";
      import * as assertNS from "node:assert/strict";

      const foo = 1;
      assert(foo > 1);
      assertNS.ok(foo);
      console.log(foo);
      fail("end");
    `;

    const expected = dedent`
      const foo = 1;
      ;
      ;
      console.log(foo);
      ;
    `;

    const code = new MagicString(fixture);

    deassert(code);
    compareCode(code.toString(), expected);
  });

  describe("uses an empty statement when a statement can't be removed", () => {
    it("if statements without brackets", () => {
      const fixture = dedent`
        import assert from "node:assert/strict";

        const foo = 1
        if (foo > 0)
          assert(foo < 100)
        else
          assert(foo > -100)
      `;

      const expected = dedent`
        const foo = 1
        if (foo > 0)
          ;
        else
          ;
      `;

      const code = new MagicString(fixture);

      deassert(code);
      compareCode(code.toString(), expected);
    });

    it("label statements", () => {
      const fixture = dedent`
        import assert from "node:assert/strict";

        const foo = 1
        label:
          assert(foo < 100)
      `;

      const expected = dedent`
        const foo = 1
        label:
          ;
      `;

      const code = new MagicString(fixture);

      deassert(code);
      compareCode(code.toString(), expected);
    });
  });

  describe("scoped", () => {
    it("doesn't remove shadowed identifiers", () => {
      const fixture = dedent`
        import { ok } from "node:assert/strict";

        const foo = 1;
        ok(foo);
        console.log(1);

        function bar() {
          ok(foo);
          console.log(2);
        }

        function baz() {
          const ok = () => {};
          ok(foo);
          console.log(3);
        }
      `;

      const expected = dedent`
        const foo = 1;
        ;
        console.log(1);

        function bar() {
          ;
          console.log(2);
        }

        function baz() {
          const ok = () => {};
          ok(foo);
          console.log(3);
        }
      `;

      const code = new MagicString(fixture);

      deassert(code);
      compareCode(code.toString(), expected);
    });

    it("doesn't remove shadowed identifiers that using function hoisting", () => {
      const fixture = dedent`
        import { ok } from "node:assert/strict";

        const foo = 1;
        ok(foo);
        console.log(1);

        function bar() {
          ok(foo);
          console.log(2);

          function ok() {
            ok(foo);
            console.log(3);
          }
        }
      `;

      const expected = dedent`
        const foo = 1;
        ;
        console.log(1);

        function bar() {
          ok(foo);
          console.log(2);

          function ok() {
            ok(foo);
            console.log(3);
          }
        }
      `;

      const code = new MagicString(fixture);

      deassert(code);
      compareCode(code.toString(), expected);
    });
  });
});
