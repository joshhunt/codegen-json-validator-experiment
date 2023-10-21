import * as t from "@babel/types";
import { Schema, SchemaProperty } from "./types.js";
import {
  toValidIdentifier,
  createPrimitivePropertyCheck,
  createObjectPropertyCheck,
  createObjectNarrowingCheck,
  createReturnObject,
  createObjectProperty,
  createTSInterface,
  createFunctionWithUnknownArg,
} from "./utils.js";

const INPUT_VARIABLE_NAME = "input";

function createBodyStatementsForProperty(
  property: SchemaProperty,
  variableName: string
) {
  if (
    property.type === "boolean" ||
    property.type === "number" ||
    property.type === "string"
  ) {
    return createPrimitivePropertyCheck(
      property.type,
      INPUT_VARIABLE_NAME,
      variableName,
      property.name,
      !property.optional
    );
  } else if (property.type === "object") {
    return createObjectPropertyCheck(
      property.objectTypeName,
      INPUT_VARIABLE_NAME,
      variableName,
      property.name,
      !property.optional
    );
  }

  throw new Error("unknown schema property type");
}

export function generateFunctionForSchema(
  schema: Schema
): [t.TSInterfaceDeclaration, t.FunctionDeclaration] {
  const bodyStatements: t.Statement[] = [];
  const returnObjectProperties: t.ObjectProperty[] = [];
  const tsInterfaceProperties: t.TSPropertySignature[] = [];

  let index = 0;
  for (const property of schema.properties) {
    index += 1;
    const variableName = toValidIdentifier(property.name, index);

    //
    // Create the main narrowing checks for the property
    const statements = createBodyStatementsForProperty(property, variableName);
    bodyStatements.push(...statements);

    //
    // Create the property for the return object
    returnObjectProperties.push(
      createObjectProperty(property.name, variableName)
    );

    //
    // Create the property for the TS interface for the actual type
    tsInterfaceProperties.push(
      generateTSInterfacePropertyForSchemaProperty(property)
    );
  }

  const functionName = `parse${schema.name}`;

  const fnBody = [
    createObjectNarrowingCheck(INPUT_VARIABLE_NAME),
    ...bodyStatements,
    createReturnObject(returnObjectProperties),
  ];
  const fnReturnType = t.tsTypeAnnotation(
    t.tsTypeReference(t.identifier(schema.name))
  );

  const fn = createFunctionWithUnknownArg(
    functionName,
    INPUT_VARIABLE_NAME,
    fnBody,
    fnReturnType
  );

  const tsInterface = createTSInterface(schema.name, tsInterfaceProperties);

  return [tsInterface, fn];
}

function generateTSInterfacePropertyForSchemaProperty(
  property: SchemaProperty
) {
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

  const propertySig = t.tsPropertySignature(propetyName, propertyType, null);
  if (property.optional) {
    propertySig.optional = true;
  }

  return propertySig;
}
