import * as t from "@babel/types";
import { ArrayPropertyType, Narrowable } from "../../types.js";
import BaseSchemaType from "./BaseSchemaType.js";

// Note: this creates a circular dependency :/
import { createNarrowingCheck } from "../../propertyChecks.js";
import { getTypeDef } from "./getTypeDef.js";
import {
  getNameIshForNarrowable,
  createTypedIdentifier,
  createTypeExpectationThrow,
} from "../../utils.js";

export class ArraySchemaType implements BaseSchemaType {
  type: ArrayPropertyType;
  name: string = "Array";

  constructor(type: ArrayPropertyType) {
    this.type = type;
  }

  narrowCheck(variable: Narrowable) {
    return t.callExpression(
      t.memberExpression(t.identifier("Array"), t.identifier("isArray")),
      [variable]
    );
  }

  cast(variable: Narrowable) {
    const valueTypeDef = getTypeDef(this.type.valueType);
    return createArrayNarrowingMap(variable, valueTypeDef);
  }
}

function createArrayNarrowingMap(
  variable: Narrowable,
  valueTypeDef: BaseSchemaType
) {
  const variableName = getNameIshForNarrowable(variable);

  const param = createTypedIdentifier(
    `${variableName}Item`,
    t.tsUnknownKeyword()
  );

  let consequent: t.Statement[] = [];
  const castExpr = valueTypeDef.cast(param);

  if (valueTypeDef.postCastStatement) {
    const variableName = getNameIshForNarrowable(variable);
    const tempVariable = t.identifier(`${variableName}Temp`);

    const variableDecl = t.variableDeclaration("const", [
      t.variableDeclarator(tempVariable, castExpr),
    ]);

    const postCheckStatement = valueTypeDef.postCastStatement(tempVariable);

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
    valueTypeDef,
    t.blockStatement(consequent),
    createTypeExpectationThrow(param.name, valueTypeDef.type)
  );

  const mapArrowFn = t.arrowFunctionExpression(
    [param],
    t.blockStatement([mapBody])
  );

  return t.callExpression(t.memberExpression(variable, t.identifier("map")), [
    mapArrowFn,
  ]);
}
