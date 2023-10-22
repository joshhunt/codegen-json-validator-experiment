import * as t from "@babel/types";
import { Narrowable } from "./types.js";
import {
  createAndAndTest,
  createAssignment,
  createMemberExpression,
  createTSTypeForPropertyType,
  createTypeExpectationThrow,
  createTypedIdentifier,
} from "./utils.js";
import BaseSchemaType from "./schema/types/BaseSchemaType.js";

export function createPropertyCheck(
  typeDef: BaseSchemaType,
  parentObjectName: string,
  variableName: string,
  propertyName: string,
  required: boolean = true
) {
  const propertyMember = createMemberExpression(parentObjectName, propertyName);

  const variable = createTypedIdentifier(
    variableName,
    createTSTypeForPropertyType(typeDef.type),
    !required
  );

  const variableDecl = t.variableDeclaration("let", [
    t.variableDeclarator(
      variable,
      required ? undefined : t.identifier("undefined")
    ),
  ]);

  const narrowed = typeDef.cast(propertyMember);

  const consequent: t.Statement[] = [createAssignment(variable, narrowed)];

  if (typeDef.postCastStatement) {
    const postCheckStatement = typeDef.postCastStatement(variable);
    consequent.push(postCheckStatement);
  }

  const ifExp = createNarrowingCheck(
    propertyMember,
    typeDef,
    t.blockStatement(consequent),
    required
      ? createTypeExpectationThrow(propertyName, typeDef.type)
      : undefined
  );

  return [variableDecl, ifExp];
}

export function createNarrowingCheck(
  variable: Narrowable,
  typeDef: BaseSchemaType,
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

  const testExp = typeDef.narrowCheck(variable);

  const ifExp = t.ifStatement(
    createAndAndTest(proceedingCheck, testExp),
    consequent,
    alternate
  );

  return ifExp;
}
