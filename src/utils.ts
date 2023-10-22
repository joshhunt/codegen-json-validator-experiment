import * as t from "@babel/types";
import { Narrowable, PropertyType } from "./types.js";

export function createTypeExpectationThrow(
  name: t.Identifier | string,
  expectedType: PropertyType
) {
  const nameString = typeof name === "string" ? name : name.name;
  return createThrowStatement(
    `Expected ${nameString} to be a valid ${stringifyType(expectedType)}`
  );
}

export function createThrowStatement(message: string) {
  return t.throwStatement(
    t.newExpression(t.identifier("Error"), [t.stringLiteral(message)])
  );
}

export function createObjectNarrowingCheck(variableName: string) {
  const variable = t.identifier(variableName);

  const typeofCheck = createTypeofTest(variable, "object", "!==");
  const nullCheck = t.binaryExpression("===", variable, t.nullLiteral());
  const check = createOrTest(typeofCheck, nullCheck);

  const throwExp = createThrowStatement("Expected object");

  const ifExp = t.ifStatement(check, throwExp);

  return ifExp;
}

export function createTypedIdentifier(
  name: string,
  type: t.TSType,
  optional = false
) {
  const variable = t.identifier(name);
  variable.typeAnnotation = t.tsTypeAnnotation(
    optional ? t.tsUnionType([type, t.tsUndefinedKeyword()]) : type
  );
  return variable;
}

function composeLogicalTests(
  operator: "&&" | "||",
  conditions: (t.Expression | undefined)[]
): t.Expression {
  const test = conditions.reduce((acc, curr) => {
    if (!acc) return curr;
    if (!curr) return acc;
    return t.logicalExpression(operator, acc, curr);
  });

  return test ?? t.booleanLiteral(true);
}

export function createAndAndTest(
  ...conditions: (t.Expression | undefined)[]
): t.Expression {
  return composeLogicalTests("&&", conditions);
}

export function createOrTest(...conditions: (t.Expression | undefined)[]) {
  return composeLogicalTests("||", conditions);
}

export function createAssignment(variable: t.Identifier, right: t.Expression) {
  return t.expressionStatement(t.assignmentExpression("=", variable, right));
}

export function createTypeofTest(
  variable: t.Expression,
  type: string,
  operator: "===" | "!==" = "==="
) {
  return t.binaryExpression(
    operator,
    t.unaryExpression("typeof", variable),
    t.stringLiteral(type)
  );
}

export function createNullCheck(
  variable: t.Expression,
  operator: "===" | "!==" = "==="
) {
  return t.binaryExpression(operator, variable, t.nullLiteral());
}

export function createMemberExpression(...parts: string[]) {
  const memberExpression = parts
    .map((v) => {
      if (t.isValidIdentifier(v)) {
        return t.identifier(v);
      }

      return t.stringLiteral(v);
    })
    .reduce<t.MemberExpression | t.Identifier | t.StringLiteral | null>(
      (acc, part) => {
        if (acc === null) {
          return part;
        }

        return t.memberExpression(acc, part, t.isStringLiteral(part));
      },
      null
    );

  if (memberExpression?.type !== "MemberExpression") {
    throw new Error(
      `Failed to create member expression - instead created a ${memberExpression?.type}`
    );
  }

  return memberExpression;
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

export function createReturnObject(properties: t.ObjectProperty[]) {
  return t.returnStatement(t.objectExpression(properties));
}

export function createTSInterface(
  name: string,
  properties: t.TSPropertySignature[]
) {
  const tsInterface = t.tsInterfaceDeclaration(
    t.identifier(name),
    null,
    null,
    t.tsInterfaceBody(properties)
  );

  return tsInterface;
}

export function createFunctionWithUnknownArg(
  fnName: string,
  argName: string,
  body: t.Statement[],
  returnType?: t.TSTypeAnnotation
) {
  const args = [createTypedIdentifier(argName, t.tsUnknownKeyword())];

  const fn = t.functionDeclaration(
    t.identifier(fnName),
    args,
    t.blockStatement(body, [])
  );
  fn.returnType = returnType;

  return fn;
}

export function createTSTypeForPropertyType(type: PropertyType): t.TSType {
  if (
    type.type === "string" ||
    type.type === "number" ||
    type.type === "boolean"
  ) {
    return t.tsTypeReference(t.identifier(type.type));
  }

  if (type.type === "date") {
    return t.tsTypeReference(t.identifier("Date"));
  }

  if (type.type === "object") {
    return t.tsTypeReference(t.identifier(type.objectTypeName));
  }

  if (type.type === "array") {
    const memberType = createTSTypeForPropertyType(type.valueType);
    return t.tsArrayType(memberType);
  }

  throw new Error(`Unknown schema type '${type.type}' to create ts type`);
}

export function stringifyType(type: PropertyType): string {
  if (
    type.type === "string" ||
    type.type === "number" ||
    type.type === "boolean" ||
    type.type === "date"
  ) {
    return type.type;
  }

  if (type.type === "object") {
    return `object(${type.objectTypeName})`;
  }

  if (type.type === "array") {
    return `array(${stringifyType(type.valueType)})`;
  }

  throw new Error(`Unable to stringify type ${JSON.stringify(type)}`);
}

export function getNameIshForNarrowable(variable: Narrowable) {
  if (variable.type === "Identifier") {
    return variable.name;
  }

  const property = variable.property;

  if (property.type === "Identifier") {
    return property.name;
  }

  throw new Error(`not implemented for type ${variable.type}`);
}
