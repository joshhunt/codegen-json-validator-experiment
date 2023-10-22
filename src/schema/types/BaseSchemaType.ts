import * as t from "@babel/types";
import { Narrowable, PropertyType } from "../../types.js";

export default abstract class BaseSchemaType {
  name: string;
  type: PropertyType;

  constructor(name: string, type: PropertyType) {
    this.name = name;
    this.type = type;
  }

  narrowCheck(variable: Narrowable): t.Expression {
    throw new Error(`narrowCheck has not been implemented for ${this.name}`);
  }

  cast(variable: Narrowable): t.Expression {
    throw new Error(`cast has not been implemented for ${this.name}`);
  }

  postCastStatement?(variable: Narrowable): t.Statement;
}
