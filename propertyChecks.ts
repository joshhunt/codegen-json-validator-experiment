import * as t from "@babel/types";
import { PropertyType } from "./types.js";
import {
  createAndAndTest,
  createAssignment,
  createMemberExpression,
  createNullCheck,
  createTSTypeForPropertyType,
  createTypeExpectationThrow,
  createTypedIdentifier,
  createTypeofTest,
  stringifyType,
} from "./utils.js";
import { PrimitiveSchemaType } from "./src/schema/types/PrimitiveSchemaType.js";
import { DateSchemaType } from "./src/schema/types/DateSchemaType.js";
import { ObjectSchemaType } from "./src/schema/types/ObjectSchemaType.js";
import { ArraySchemaType } from "./src/schema/types/ArraySchemaType.js";
import BaseSchemaType from "./src/schema/types/BaseSchemaType.js";
import generate from "@babel/generator";

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

  const typeDef = getTypeDef(type);
  const narrowed = createCast(propertyMember, type);

  const consequent: t.Statement[] = [createAssignment(variable, narrowed)];

  if (typeDef.postCastStatement) {
    const postCheckStatement = typeDef.postCastStatement(variable);
    consequent.push(postCheckStatement);
  }

  const ifExp = createNarrowingCheck(
    propertyMember,
    type,
    t.blockStatement(consequent),
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

  const typeDef = getTypeDef(type);
  const testExp = typeDef.narrowCheck(variable);

  const ifExp = t.ifStatement(
    createAndAndTest(proceedingCheck, testExp),
    consequent,
    alternate
  );

  return ifExp;
}

function createCast(variable: Narrowable, type: PropertyType) {
  const typeDef = getTypeDef(type);
  return typeDef.cast(variable);
}

export function createArrayNarrowingMap(
  variable: Narrowable,
  arrayValueType: PropertyType
) {
  const param = createTypedIdentifier(`item`, t.tsUnknownKeyword());

  const typeDef = getTypeDef(arrayValueType);
  let consequent: t.Statement[] = [];
  const castExpr = typeDef.cast(param);

  if (typeDef.postCastStatement) {
    const tempVariable = t.identifier("temp");
    const variableDecl = t.variableDeclaration("const", [
      t.variableDeclarator(tempVariable, castExpr),
    ]);

    const postCheckStatement = typeDef.postCastStatement(tempVariable);

    consequent = [
      variableDecl,
      postCheckStatement,
      t.returnStatement(tempVariable),
    ];
  } else {
    consequent = [t.returnStatement(castExpr)];
  }

  const mapBody = createNarrowingCheck(
    param,
    arrayValueType,
    t.blockStatement(consequent),
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

function getTypeDef(type: PropertyType): BaseSchemaType {
  if (
    type.type === "string" ||
    type.type === "number" ||
    type.type === "boolean"
  ) {
    return new PrimitiveSchemaType(type);
  }

  if (type.type === "date") {
    return new DateSchemaType(type);
  }

  if (type.type === "object") {
    return new ObjectSchemaType(type);
  }

  if (type.type === "array") {
    return new ArraySchemaType(type);
  }

  throw new Error("unable to create type def for " + stringifyType(type));
}
