import dedent from "dedent";
import MagicString from "magic-string";
import { describe, it } from "vitest";

import deassert from "../src";

import { compareCode } from "./utils";

describe("imports", () => {
  it.each([
    `import assert from "node:assert/strict";`,
    `import * as assert from "node:assert/strict";`,
    `import { ok, fail } from "node:assert/strict";`,
    `import assert, { ok, fail } from "node:assert/strict";`,
  ])("removes assertion module imports", (importCode) => {
    const fixture = dedent`
      ${importCode}
      import foo from "./foo";

      console.log(foo);
    `;

    const expected = dedent`
      import foo from "./foo";

      console.log(foo);
    `;

    const code = new MagicString(fixture);

    deassert(code);
    compareCode(code.toString(), expected);
  });

  describe("custom assertion library", () => {
    it("removes assertion module imports", () => {
      const fixture = dedent`
        import { assert } from "chai";
        import foo from "./foo";

        console.log(foo);
      `;

      const expected = dedent`
        import foo from "./foo";

        console.log(foo);
      `;

      const code = new MagicString(fixture);

      deassert(code, { modules: ["chai"] });
      compareCode(code.toString(), expected);
    });
  });
});
