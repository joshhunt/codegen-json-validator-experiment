import * as t from "@babel/types";
import { Schema, PropertyNameVariableMapping } from "./types.js";
import {
  toValidIdentifier,
  createPrimitivePropertyCheck,
  createObjectPropertyCheck,
  typedIdentifier,
  createObjectNarrowingCheck,
  createReturnObject,
} from "./utils.js";

const INPUT_VARIABLE_NAME = "input";

export function generateFunctionForSchema(
  schema: Schema
): [t.TSInterfaceDeclaration, t.FunctionDeclaration] {
  const propertyChecks: [PropertyNameVariableMapping, t.Statement[]][] =
    schema.properties.map((property, index) => {
      const { name, type } = property;

      const variableName = toValidIdentifier(name, index);
      const propertyName = name;

      let statements: t.Statement[];

      if (type === "boolean" || type === "number" || type === "string") {
        statements = createPrimitivePropertyCheck(
          type,
          INPUT_VARIABLE_NAME,
          variableName,
          propertyName
        );
      } else if (type === "object") {
        statements = createObjectPropertyCheck(
          property.objectTypeName,
          INPUT_VARIABLE_NAME,
          variableName,
          propertyName
        );
      } else {
        throw new Error("unknown schema property type");
      }

      const val: [PropertyNameVariableMapping, t.Statement[]] = [
        { variableName, propertyName },
        statements,
      ];

      return val;
    });

  const functionName = `parse${schema.name}`;

  const fn = t.functionDeclaration(
    t.identifier(functionName),
    [
      typedIdentifier(
        INPUT_VARIABLE_NAME,
        t.tsTypeAnnotation(t.tsUnknownKeyword())
      ),
    ],
    t.blockStatement(
      [
        createObjectNarrowingCheck(INPUT_VARIABLE_NAME),
        ...propertyChecks.flatMap(([, statements]) => statements),
        createReturnObject(propertyChecks.map((v) => v[0])),
      ],
      []
    )
  );
  fn.returnType = t.tsTypeAnnotation(
    t.tsTypeReference(t.identifier(schema.name))
  );

  const tsInterface = generateTsInterfaceForSchema(schema);

  return [tsInterface, fn];
}

function generateTsInterfaceForSchema(schema: Schema) {
  const properties = schema.properties.map((property) => {
    const { name, type } = property;

    let propertyType: t.TSTypeAnnotation;
    if (type === "boolean" || type === "number" || type === "string") {
      propertyType = t.tsTypeAnnotation(t.tsTypeReference(t.identifier(type)));
    } else if (type === "object") {
      propertyType = t.tsTypeAnnotation(
        t.tsTypeReference(t.identifier(property.objectTypeName))
      );
    } else {
      throw new Error("unknown schema property type");
    }

    const propetyName = t.isValidIdentifier(name)
      ? t.identifier(name)
      : t.stringLiteral(name);

    return t.tsPropertySignature(propetyName, propertyType, null);
  });

  const tsInterface = t.tsInterfaceDeclaration(
    t.identifier(schema.name),
    null,
    null,
    t.tsInterfaceBody(properties)
  );

  return tsInterface;
}
