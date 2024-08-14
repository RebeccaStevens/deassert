import dedent from "dedent";
import MagicString from "magic-string";
import { describe, it } from "vitest";

import deassert from "../src";

import { compareCode } from "./utils";

describe("try-catch", () => {
  it("removes assertions from try catch blocks", () => {
    const fixture = dedent`
      import { ok as assert, fail as assertNever, AssertionError } from "node:assert/strict";

      try {
        assert(foo > 1);
      }
      catch (error) {
        assert(error instanceof Error, "Unexpected Error.");
        assert(!(error instanceof AssertionError), error);

        console.error(error);
      }
    `;

    const expected = dedent`
      try {
        ;
      }
      catch (error) {
        ;
        ;
        console.error(error);
      }
    `;

    const code = new MagicString(fixture);

    deassert(code);
    compareCode(code.toString(), expected);
  });
});
