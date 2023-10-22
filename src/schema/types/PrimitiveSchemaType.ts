import {
  Narrowable,
  PropertyType,
  SchemaPropertyDefinition,
} from "../../../types.js";
import { createTypeofTest } from "../../../utils.js";

export const PrimitiveSchemaType: SchemaPropertyDefinition = {
  name: "Primitive",

  narrowCheck(variable: Narrowable, type: PropertyType) {
    return createTypeofTest(variable, type.type);
  },

  cast(variable: Narrowable) {
    return variable;
  },
};
