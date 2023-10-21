import * as t from "@babel/types";
import generator from "@babel/generator";
import * as fs from "fs/promises";
import { Schema } from "./types.js";
import { formatSourceCode } from "./formatOutput.js";
import { generateFunctionForSchema } from "./generator.js";

const woweeSchema: Schema = {
  name: "Wowee",
  type: "object",
  properties: [
    { name: "beep", type: "number" },
    { name: "boop", type: "boolean" },
  ],
};
const worldSchema: Schema = {
  name: "World",
  type: "object",
  properties: [
    { name: "foo", type: "string" },
    { name: "bar", type: "number" },
    { name: "baz", type: "boolean" },
    { name: "optionalFoo", type: "string", optional: true },
  ],
};

const helloSchema: Schema = {
  name: "Hello",
  type: "object",
  properties: [
    { name: "name", type: "string" },
    { name: "age", type: "number" },
    { name: "foo-bar", type: "number" },
    { name: "world", type: "object", objectTypeName: worldSchema.name },
    {
      name: "wowee-is-optional",
      type: "object",
      objectTypeName: woweeSchema.name,
      optional: true,
    },
  ],
};

const schemas = [helloSchema, worldSchema, woweeSchema];

const fileBody = schemas.flatMap((schema) => {
  return generateFunctionForSchema(schema);
});

const program: t.Program = {
  type: "Program",
  body: fileBody,
  directives: [],
  sourceType: "module",
  sourceFile: "",
};

const generatedCode = generator.default(program).code;
const formattedCode = await formatSourceCode(generatedCode);

await fs.writeFile("output.ts", formattedCode);

console.log(formattedCode);
