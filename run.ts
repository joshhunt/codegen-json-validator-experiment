import * as t from "@babel/types";
import generator from "@babel/generator";
import * as fs from "fs/promises";
import _, { Schema } from "./src/types.js";
import { formatSourceCode } from "./src/formatOutput.js";
import { generateFunctionForSchema } from "./generator.js";

const worldSchema: Schema = {
  name: "World",
  type: "object",
  properties: [
    _("foo", _.string),
    _("bar", _.number),
    _("baz", _.boolean),
    _.optional(_("optionalFoo", _.string)),
    _("validDates", _.array(_.date)),
  ],
};

const helloSchema: Schema = {
  name: "Hello",
  type: "object",
  properties: [
    _("name", _.string),
    _("age", _.number),
    _("is-handsome", _.boolean),
    _("dateOfBirth", _.date),

    _("world", _.object(worldSchema.name)),
    _.optional(_("optionalWorld", _.object(worldSchema.name))),

    _("arrayOfNumbers", _.array(_.number)),
    _("arrayOfObjects", _.array(_.object(worldSchema.name))),
    _("arrayOfArrayofNumbers", _.array(_.array(_.number))),
  ],
};

const schemas = [helloSchema, worldSchema];

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

console.log("Generated successfully");
