import * as t from "@babel/types";
import { Narrowable, ObjectPropertyType } from "../../../types.js";
import {
  createAndAndTest,
  createNullCheck,
  createTypeofTest,
} from "../../../utils.js";
import BaseSchemaType from "./BaseSchemaType.js";

export class ObjectSchemaType implements BaseSchemaType {
  type: ObjectPropertyType;
  name: string = "Object";

  constructor(type: ObjectPropertyType) {
    this.type = type;
  }

  narrowCheck(variable: Narrowable) {
    const typeofCheck = createTypeofTest(variable, "object");
    const notNullCheck = createNullCheck(variable, "!==");
    return createAndAndTest(typeofCheck, notNullCheck);
  }

  cast(variable: Narrowable) {
    const parserFunctionName = `parse${this.type.objectTypeName}`;
    return t.callExpression(t.identifier(parserFunctionName), [variable]);
  }
}
