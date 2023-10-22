import * as t from "@babel/types";
import { Schema, SchemaProperty } from "./src/types.js";
import {
  toValidIdentifier,
  createObjectNarrowingCheck,
  createReturnObject,
  createObjectProperty,
  createTSInterface,
  createFunctionWithUnknownArg,
  createTSTypeForPropertyType,
} from "./src/utils.js";
import { createPropertyCheck } from "./src/propertyChecks.js";
import { getTypeDef } from "./src/schema/types/getTypeDef.js";

const INPUT_VARIABLE_NAME = "input";

function createBodyStatementsForProperty(
  property: SchemaProperty,
  variableName: string
) {
  const typeDef = getTypeDef(property.type);
  return createPropertyCheck(
    typeDef,
    INPUT_VARIABLE_NAME,
    variableName,
    property.name,
    !property.optional
  );
}

export function generateFunctionForSchema(
  schema: Schema
): [t.TSInterfaceDeclaration, t.Statement] {
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

  const exportStatement = t.exportNamedDeclaration(fn, []);

  const tsInterface = createTSInterface(schema.name, tsInterfaceProperties);

  return [tsInterface, exportStatement];
}

function generateTSInterfacePropertyForSchemaProperty(
  property: SchemaProperty
) {
  const { name, type } = property;

  const propertyType = createTSTypeForPropertyType(type);

  const propetyName = t.isValidIdentifier(name)
    ? t.identifier(name)
    : t.stringLiteral(name);

  const propertySig = t.tsPropertySignature(
    propetyName,
    t.tsTypeAnnotation(propertyType),
    null
  );
  if (property.optional) {
    propertySig.optional = true;
  }

  return propertySig;
}
