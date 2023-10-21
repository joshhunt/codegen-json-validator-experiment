import * as t from "@babel/types";
import { PropertyNameVariableMapping, Schema } from "./types.js";

export function typedIdentifier(
  name: string,
  type: t.Identifier["typeAnnotation"]
) {
  const node = t.identifier(name);
  node.typeAnnotation = type;
  return node;
}

function createThrowStatement(message: string) {
  return t.throwStatement(
    t.newExpression(t.identifier("Error"), [t.stringLiteral(message)])
  );
}

export function createObjectNarrowingCheck(variableName: string) {
  const variable = t.identifier(variableName);

  const typeofCheck = t.binaryExpression(
    "!==",
    t.unaryExpression("typeof", variable),
    t.stringLiteral("object")
  );
  const nullCheck = t.binaryExpression("===", variable, t.nullLiteral());
  const check = t.logicalExpression("||", typeofCheck, nullCheck);

  const throwExp = createThrowStatement("Expected object");

  const ifExp = t.ifStatement(check, throwExp);

  return ifExp;
}

export function createObjectPropertyCheck(
  objectType: string,
  parentObjectName: string,
  variableName: string,
  propertyName: string
) {
  const object = t.identifier(parentObjectName);
  const variable = t.identifier(variableName);
  const propertyMember = createMemberExpression(object, propertyName);

  const variableDecl = t.variableDeclaration("let", [
    t.variableDeclarator(variable),
  ]);

  const inCheck = t.binaryExpression(
    "in",
    t.stringLiteral(propertyName),
    object
  );
  const typeofCheck = createTypeofExp(propertyMember, "object");
  const notNullCheck = t.binaryExpression("!==", variable, t.nullLiteral());

  const parserFunctionName = `parse${objectType}`;
  const callExp = t.callExpression(t.identifier(parserFunctionName), [
    propertyMember,
  ]);

  const ifExp = t.ifStatement(
    createAndAndTest(inCheck, typeofCheck, notNullCheck),
    createAssignment(variable, callExp),
    createThrowStatement(`Expected valid ${propertyName}`)
  );

  return [variableDecl, ifExp];
}

export function createPrimitivePropertyCheck(
  type: "string" | "number" | "boolean",
  parentObjectName: string,
  variableName: string,
  propertyName: string
) {
  const object = t.identifier(parentObjectName);
  const variable = t.identifier(variableName);
  const propertyMember = createMemberExpression(object, propertyName);

  const variableDecl = t.variableDeclaration("let", [
    t.variableDeclarator(variable),
  ]);

  const inCheck = t.binaryExpression(
    "in",
    t.stringLiteral(propertyName),
    object
  );

  const typeofCheck = createTypeofExp(propertyMember, type);

  const ifExp = t.ifStatement(
    createAndAndTest(inCheck, typeofCheck),
    createAssignment(variable, propertyMember),
    createThrowStatement(`Expected valid ${propertyName}`)
  );

  return [variableDecl, ifExp];
}

function createAndAndTest(...conditions: t.Expression[]) {
  return conditions.reduce((acc, curr) => t.logicalExpression("&&", acc, curr));
}

function createAssignment(variable: t.Identifier, right: t.Expression) {
  return t.expressionStatement(t.assignmentExpression("=", variable, right));
}

function createTypeofExp(variable: t.Expression, type: string) {
  return t.binaryExpression(
    "===",
    t.unaryExpression("typeof", variable),
    t.stringLiteral(type)
  );
}

export function isValidIdentifier(name: string) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name);
}

function createMemberExpression(object: t.Identifier, propertyName: string) {
  if (isValidIdentifier(propertyName)) {
    return t.memberExpression(object, t.identifier(propertyName));
  }

  return t.memberExpression(object, t.stringLiteral(propertyName), true);
}

// a function that takes a string and returns that string as a valid javascript identifier
// TODO: this is a really dodgy implementation, but it's good enough for now
export function toValidIdentifier(input: string, index: number) {
  if (t.isValidIdentifier(input)) {
    return input;
  } else {
    // replace all non-letter characters with underscores
    return `p${index}_` + input.replace(/[^a-zA-Z]/g, "");
  }
}

export function createObjectProperty(
  propertyName: string,
  variableName: string
): t.ObjectProperty {
  const property = t.isValidIdentifier(propertyName)
    ? t.identifier(propertyName)
    : t.stringLiteral(propertyName);
  const canShorthand = propertyName === variableName;
  const requiresComputed = property.type === "StringLiteral";

  return t.objectProperty(
    property,
    t.identifier(variableName),
    requiresComputed,
    canShorthand
  );
}

export function createReturnObject(
  propertyMappings: PropertyNameVariableMapping[]
) {
  const propertyExpressions = propertyMappings.map(
    ({ propertyName, variableName }) => {
      return createObjectProperty(propertyName, variableName);
    }
  );

  return t.returnStatement(t.objectExpression(propertyExpressions));
}
