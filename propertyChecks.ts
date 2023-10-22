import * as t from "@babel/types";
import { PropertyType } from "./types.js";
import {
  createAndAndTest,
  createAssignment,
  createMemberExpression,
  createNullCheck,
  createTSTypeForPropertyType,
  createThrowStatement,
  createTypedIdentifier,
  createTypeofTest,
  stringifyType,
} from "./utils.js";

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
    required
      ? createThrowStatement(`Expected valid ${propertyName}`)
      : undefined
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

  //
  // Handle primitive narrowing
  if (
    type.type === "string" ||
    type.type === "number" ||
    type.type === "boolean"
  ) {
    const typeofCheck = createTypeofTest(variable, type.type);
    const ifExp = t.ifStatement(
      createAndAndTest(proceedingCheck, typeofCheck),
      consequent,
      alternate
    );

    return ifExp;
  }

  //
  // Handle object narrowing
  if (type.type === "object") {
    const typeofCheck = createTypeofTest(variable, "object");
    const notNullCheck = createNullCheck(variable, "!==");
    const ifExp = t.ifStatement(
      createAndAndTest(proceedingCheck, typeofCheck, notNullCheck),
      consequent,
      alternate
    );

    return ifExp;
  }

  //
  // Handle array narrowing
  if (type.type === "array") {
    const arrayCheck = t.callExpression(
      t.memberExpression(t.identifier("Array"), t.identifier("isArray")),
      [variable]
    );

    const ifExp = t.ifStatement(
      createAndAndTest(proceedingCheck, arrayCheck),
      consequent,
      alternate
    );

    return ifExp;
  }

  throw new Error(
    `Unknown schema type ${stringifyType(type)} to create narrowing check`
  );
}

function createCast(variable: Narrowable, type: PropertyType) {
  if (
    type.type === "string" ||
    type.type === "number" ||
    type.type === "boolean"
  ) {
    return variable;
  } else if (type.type === "object") {
    const parserFunctionName = `parse${type.objectTypeName}`;
    return t.callExpression(t.identifier(parserFunctionName), [variable]);
  } else if (type.type === "array") {
    return createArrayNarrowingMap(variable, type.valueType);
  }

  throw new Error("unknown type here");
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
    createThrowStatement(`Expected valid ${param.name}`)
  );

  const mapArrowFn = t.arrowFunctionExpression(
    [param],
    t.blockStatement([mapBody])
  );

  return t.callExpression(t.memberExpression(variable, t.identifier("map")), [
    mapArrowFn,
  ]);
}
