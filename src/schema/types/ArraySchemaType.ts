import * as t from "@babel/types";
import { ArrayPropertyType, Narrowable } from "../../../types.js";
import BaseSchemaType from "./BaseSchemaType.js";

// Note: this creates a circular dependency :/
import { createArrayNarrowingMap } from "../../../propertyChecks.js";

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
    return createArrayNarrowingMap(variable, this.type.valueType);
  }
}
