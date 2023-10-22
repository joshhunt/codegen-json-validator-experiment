import * as t from "@babel/types";
import { PropertyType } from "./types.js";
import {
  createAndAndTest,
  createAssignment,
  createMemberExpression,
  createNullCheck,
  createOrTest,
  createTSTypeForPropertyType,
  createTypeExpectationThrow,
  createTypedIdentifier,
  createTypeofTest,
  stringifyType,
} from "./utils.js";
import { PrimitiveSchemaType } from "./src/schema/types/PrimitiveSchemaType.js";

type Narrowable = t.Identifier | t.MemberExpression;

export function createPropertyCheck(
  type: PropertyType,
  parentObjectName: string,
  variableName: string,
  propertyName: string,
  required: boolean = true
) {
  const propertyMember = createMemberExpression(parentObjectName, propertyName);

  const variable = createTypedIdentifier(
    variableName,
    createTSTypeForPropertyType(type),
    !required
  );

  const variableDecl = t.variableDeclaration("let", [
    t.variableDeclarator(
      variable,
      required ? undefined : t.identifier("undefined")
    ),
  ]);

  const narrowed = createCast(propertyMember, type);

  const ifExp = createNarrowingCheck(
    propertyMember,
    type,
    createAssignment(variable, narrowed),
    required ? createTypeExpectationThrow(propertyName, type) : undefined
  );

  return [variableDecl, ifExp];
}

function createNarrowingCheck(
  variable: Narrowable,
  type: PropertyType,
  consequent: t.Statement,
  alternate?: t.Statement
) {
  // First, check if we're narrowing a property of an object
  // and thus will need to check if the property is in the object
  let proceedingCheck: t.Expression | undefined = undefined;
  if (variable.type === "MemberExpression") {
    // Doesn't support nested object.foo.bar.baz yet
    if (variable.object.type !== "Identifier") {
      throw new Error(`not implemented for type ${variable.object.type}`);
    }

    let propertyName: string;
    if (variable.property.type === "Identifier") {
      propertyName = variable.property.name;
    } else if (variable.property.type === "StringLiteral") {
      propertyName = variable.property.value;
    } else {
      throw new Error(`not implemented for type ${variable.property.type}`);
    }

    proceedingCheck = t.binaryExpression(
      "in",
      t.stringLiteral(propertyName),
      t.identifier(variable.object.name)
    );
  }

  let testExp: t.Expression | undefined = undefined;

  // Handle primitive narrowing
  if (
    type.type === "string" ||
    type.type === "number" ||
    type.type === "boolean"
  ) {
    testExp = PrimitiveSchemaType.narrowCheck(variable, type);
  }

  // Handle date narrowing.
  if (type.type === "date") {
    const stringTypeCheck = createTypeofTest(variable, "string");
    const dateInstnaceCheck = t.binaryExpression(
      "instanceof",
      variable,
      t.identifier("Date")
    );
    testExp = createOrTest(stringTypeCheck, dateInstnaceCheck);
  }

  // Handle object narrowing
  if (type.type === "object") {
    const typeofCheck = createTypeofTest(variable, "object");
    const notNullCheck = createNullCheck(variable, "!==");
    testExp = createAndAndTest(typeofCheck, notNullCheck);
  }

  // Handle array narrowing
  if (type.type === "array") {
    testExp = t.callExpression(
      t.memberExpression(t.identifier("Array"), t.identifier("isArray")),
      [variable]
    );
  }

  if (testExp === undefined) {
    throw new Error(
      `Unknown schema type ${stringifyType(type)} to create narrowing check`
    );
  }

  const ifExp = t.ifStatement(
    createAndAndTest(proceedingCheck, testExp),
    consequent,
    alternate
  );

  return ifExp;
}

function createCast(variable: Narrowable, type: PropertyType) {
  if (
    type.type === "string" ||
    type.type === "number" ||
    type.type === "boolean"
  ) {
    return PrimitiveSchemaType.cast(variable, type);
  }

  if (type.type === "date") {
    const instanceofCheck = t.binaryExpression(
      "instanceof",
      variable,
      t.identifier("Date")
    );
    const ternery = t.conditionalExpression(
      instanceofCheck,
      variable,
      t.newExpression(t.identifier("Date"), [variable])
    );

    return ternery;
  }

  if (type.type === "object") {
    const parserFunctionName = `parse${type.objectTypeName}`;
    return t.callExpression(t.identifier(parserFunctionName), [variable]);
  }

  if (type.type === "array") {
    return createArrayNarrowingMap(variable, type.valueType);
  }

  throw new Error(`Unknown schema type ${stringifyType(type)} to cast`);
}

function createArrayNarrowingMap(
  variable: Narrowable,
  arrayValueType: PropertyType
) {
  const param = createTypedIdentifier(`item`, t.tsUnknownKeyword());
  const narrowed = createCast(param, arrayValueType);
  const mapBody = createNarrowingCheck(
    param,
    arrayValueType,
    t.returnStatement(narrowed),
    createTypeExpectationThrow(param.name, arrayValueType)
  );

  const mapArrowFn = t.arrowFunctionExpression(
    [param],
    t.blockStatement([mapBody])
  );

  return t.callExpression(t.memberExpression(variable, t.identifier("map")), [
    mapArrowFn,
  ]);
}
