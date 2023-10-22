import { Narrowable, PrimitivePropertyType } from "../../../types.js";
import { createTypeofTest } from "../../../utils.js";
import BaseSchemaType from "./BaseSchemaType.js";

export class PrimitiveSchemaType implements BaseSchemaType {
  type: PrimitivePropertyType;
  name: string = "Primitive";

  constructor(type: PrimitivePropertyType) {
    this.type = type;
  }

  narrowCheck(variable: Narrowable) {
    return createTypeofTest(variable, this.type.type);
  }

  cast(variable: Narrowable) {
    return variable;
  }
}
