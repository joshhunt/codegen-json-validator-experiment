import { describe, expect, test } from "@jest/globals";
import generator from "@babel/generator";
import {
  createAndAndTest,
  createFunctionWithUnknownArg,
  createMemberExpression,
  createNullCheck,
  createObjectNarrowingCheck,
  createOrTest,
  createTSTypeForPropertyType,
  createTypedIdentifier,
  toValidIdentifier,
} from "./utils.js";
import * as t from "@babel/types";
import _ from "./types.js";

function generate(node: t.Node) {
  return generator.default(node).code;
}

describe("utils", () => {
  describe("createTypedIdentifier", () => {
    test("creates a typed identifier", () => {
      const identifier = createTypedIdentifier("foo", t.tsStringKeyword());
      // we need to wrap the identifier in a variable declaration to generate code
      // that includes the type annotation
      const node = t.variableDeclaration("let", [
        t.variableDeclarator(identifier),
      ]);
      expect(generate(node)).toBe("let foo: string;");
    });

    test("creates an optional typed identifier", () => {
      const identifier = createTypedIdentifier(
        "foo",
        t.tsStringKeyword(),
        true
      );
      // we need to wrap the identifier in a variable declaration to generate code
      // that includes the type annotation
      const node = t.variableDeclaration("let", [
        t.variableDeclarator(identifier),
      ]);
      expect(generate(node)).toBe("let foo: string | undefined;");
    });
  });

  describe("createFunctionWithUnknownArg", () => {
    test("makes the function", () => {
      const node = createFunctionWithUnknownArg("foo", "bar", []);
      expect(generate(node)).toBe("function foo(bar: unknown) {}");
    });
  });

  describe("createNullCheck", () => {
    test("create a null check", () => {
      const node = createNullCheck(t.identifier("foo"));
      expect(generate(node)).toBe("foo === null");
    });

    test("create a not-null check", () => {
      const node = createNullCheck(t.identifier("foo"), "!==");
      expect(generate(node)).toBe("foo !== null");
    });
  });

  describe("createAndAndTest", () => {
    test("create a && test", () => {
      const test = createAndAndTest(t.identifier("foo"), t.identifier("bar"));
      expect(generate(test)).toBe("foo && bar");
    });

    test("create a && test with multiple nodes", () => {
      const test = createAndAndTest(
        t.identifier("foo"),
        t.identifier("bar"),
        t.identifier("baz")
      );
      expect(generate(test)).toBe("foo && bar && baz");
    });

    test("create a && test a single node", () => {
      const test = createAndAndTest(t.identifier("foo"));
      expect(generate(test)).toBe("foo");
    });

    test("create a && test with undefined nodes", () => {
      const test = createAndAndTest(
        t.identifier("foo"),
        undefined,
        t.identifier("baz")
      );
      expect(generate(test)).toBe("foo && baz");
    });

    test("just return true if all nodes are undefined", () => {
      const test = createAndAndTest(undefined);
      expect(generate(test)).toBe("true");
    });
  });

  describe("createOrTest", () => {
    test("create a || test", () => {
      const test = createOrTest(t.identifier("foo"), t.identifier("bar"));
      expect(generate(test)).toBe("foo || bar");
    });

    test("create a || test with multiple nodes", () => {
      const test = createOrTest(
        t.identifier("foo"),
        t.identifier("bar"),
        t.identifier("baz")
      );
      expect(generate(test)).toBe("foo || bar || baz");
    });

    test("create a || test a single node", () => {
      const test = createOrTest(t.identifier("foo"));
      expect(generate(test)).toBe("foo");
    });

    test("create a || test with undefined nodes", () => {
      const test = createOrTest(
        t.identifier("foo"),
        undefined,
        t.identifier("baz")
      );
      expect(generate(test)).toBe("foo || baz");
    });

    test("just return true if all nodes are undefined", () => {
      const test = createOrTest(undefined);
      expect(generate(test)).toBe("true");
    });
  });

  describe("createObjectNarrowingCheck", () => {
    test("create an object narrowing check", () => {
      const node = createObjectNarrowingCheck("foo");
      expect(generate(node)).toBe(
        `if (typeof foo !== "object" || foo === null) throw new Error("Expected object");`
      );
    });
  });

  describe("toValidIdentifier", () => {
    test.each([
      ["foo", "foo"],
      ["foo-bar", "p69_foobar"],
      ["foo-bar-baz", "p69_foobarbaz"],
      ["foo-1", "p69_foo"],
      ["1-foo", "p69_foo"],
      ["foo-1-bar", "p69_foobar"],
      ["foo-bar-1", "p69_foobar"],
    ])("converts %s to %s", (input, expected) => {
      expect(toValidIdentifier(input, 69)).toBe(expected);
    });
  });

  describe("createTSTypeForPropertyType", () => {
    test.each([
      [_.string(), "string"],
      [_.number(), "number"],
      [_.boolean(), "boolean"],
      [_.date(), "Date"],
      [_.array(_.string), "string[]"],
      [_.array(_.array(_.string)), "string[][]"],
      [_.object("World"), "World"],
    ])("creates a TSType for '%j' type", (input, expected) => {
      const type = createTSTypeForPropertyType(input);
      expect(generate(type)).toEqual(expected);
    });
  });

  describe("createMemberExpression", () => {
    test("creates a simple member expression", () => {
      const memberExpression = createMemberExpression("foo", "bar");
      expect(generate(memberExpression)).toBe("foo.bar");
    });

    test("creates a nested member expression", () => {
      const memberExpression = createMemberExpression("foo", "bar", "baz");
      expect(generate(memberExpression)).toBe("foo.bar.baz");
    });

    test("creates a computed member expression", () => {
      const memberExpression = createMemberExpression("foo", "bar-baz");
      expect(generate(memberExpression)).toBe('foo["bar-baz"]');
    });

    test("creates a nested computed member expression", () => {
      const memberExpression = createMemberExpression("foo", "bar-baz", "baz");
      expect(generate(memberExpression)).toBe('foo["bar-baz"].baz');
    });
  });
});
