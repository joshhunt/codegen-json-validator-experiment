import * as prettier from "prettier";
import { ESLint, Linter } from "eslint";
import eslintTsParser from "@typescript-eslint/parser";

export async function formatSourceCode(code: string) {
  const linter = new Linter();
  /// @ts-expect-error
  linter.defineParser("@typescript-eslint/parser", eslintTsParser);
  /// @ts-expect-error
  const results = linter.verifyAndFix(code, ESLINT_CONFIG);

  if (results.messages.length > 0) {
    console.log(results);
    throw new Error("Linting failed");
  }

  const prettyCode = await prettier.format(results.output, {
    parser: "babel-ts",
    printWidth: 100,
  });

  return prettyCode;
}

const ESLINT_CONFIG = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    ecmaVersion: "latest",
  },
  env: {
    es2022: true,
    node: true,
  },
  rules: {
    ["curly"]: "error",
    "padding-line-between-statements": [
      "error",
      { blankLine: "always", prev: "*", next: "function" },
      { blankLine: "always", prev: "function", next: "*" },
      { blankLine: "always", prev: "*", next: "export" },
      { blankLine: "always", prev: "export", next: "*" },
      { blankLine: "always", prev: "*", next: "if" },
      { blankLine: "always", prev: "if", next: "*" },
      { blankLine: "never", prev: "let", next: "if" },
    ],
  },
};
