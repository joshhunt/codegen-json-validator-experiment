import { PropertyType } from "../../types.js";
import { stringifyType } from "../../utils.js";
import { ArraySchemaType } from "./ArraySchemaType.js";
import BaseSchemaType from "./BaseSchemaType.js";
import { DateSchemaType } from "./DateSchemaType.js";
import { ObjectSchemaType } from "./ObjectSchemaType.js";
import { PrimitiveSchemaType } from "./PrimitiveSchemaType.js";

export function getTypeDef(type: PropertyType): BaseSchemaType {
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
