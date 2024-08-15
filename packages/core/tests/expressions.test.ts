import dedent from "dedent";
import MagicString from "magic-string";
import { describe, it } from "vitest";

import deassert from "../src";

import { compareCode } from "./utils";

describe.each([undefined, "chai"])("modules", (library) => {
  const modules = library === undefined ? undefined : [library];

  describe("call expressions", () => {
    it.each(["?? assert.fail()", "|| assert.fail()", "&& assert(foo > 0)"])(
      "removes assertion call expressions from logical expressions",
      (test) => {
        const fixture = dedent`
          import assert from "${library ?? "node:assert/strict"}";

          const foo = 5;
          const bar = foo ${test};
          console.log(bar);
        `;

        const expected = dedent`
          const foo = 5;
          const bar = foo;
          console.log(bar);
        `;

        const code = new MagicString(fixture);

        deassert(code, { modules });
        compareCode(code.toString(), expected);
      },
    );

    it("removes assertion call expressions from sequence expressions", () => {
      const fixture = dedent`
        import assert from "${library ?? "node:assert/strict"}";

        const foo = 5;
        const bar = (assert(foo > 0), foo);
        const baz = (assert(bar > 0), console.log(bar), foo);
      `;

      const expected = dedent`
        const foo = 5;
        const bar = (foo);
        const baz = (console.log(bar), foo);
      `;

      const code = new MagicString(fixture);

      deassert(code, { modules });
      compareCode(code.toString(), expected);
    });

    it("removes assertion call expressions from conditional expressions", () => {
      const fixture = dedent`
        import assert from "${library ?? "node:assert/strict"}";

        const foo = 5;
        const bar = foo > 0 ? foo : assert.fail();
        const baz = foo < 0 ? assert.fail() : foo;
        const qux = foo < 0 ? assert.fail() : assert.fail();
        console.log(bar, baz);
      `;

      const expected = dedent`
        const foo = 5;
        const bar = ((foo > 0) || true) ? foo : undefined;
        const baz = ((foo < 0) && false) ? undefined : foo;
        const qux = ((((foo < 0) || true)) && false) ? undefined : undefined;
        console.log(bar, baz);
      `;

      const code = new MagicString(fixture);

      deassert(code, { modules });
      compareCode(code.toString(), expected);
    });
  });
});
