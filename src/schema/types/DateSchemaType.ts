import * as t from "@babel/types";
import { DatePropertyType, Narrowable, PropertyType } from "../../types.js";
import {
  createOrTest,
  createTypeExpectationThrow,
  createTypeofTest,
} from "../../utils.js";
import BaseSchemaType from "./BaseSchemaType.js";
import generate from "@babel/generator";

export class DateSchemaType implements BaseSchemaType {
  type: DatePropertyType;
  name: string = "Date";

  constructor(type: DatePropertyType) {
    this.type = type;
  }

  narrowCheck(variable: Narrowable) {
    const stringTypeCheck = createTypeofTest(variable, "string");
    const dateInstanceCheck = t.binaryExpression(
      "instanceof",
      variable,
      t.identifier("Date")
    );
    return createOrTest(stringTypeCheck, dateInstanceCheck);
  }

  cast(variable: Narrowable) {
    const instanceofCheck = t.binaryExpression(
      "instanceof",
      variable,
      t.identifier("Date")
    );

    return t.conditionalExpression(
      instanceofCheck,
      variable,
      t.newExpression(t.identifier("Date"), [variable])
    );
  }

  postCastStatement(variable: Narrowable) {
    const check = t.unaryExpression(
      "!",
      t.callExpression(t.identifier("isNaN"), [
        t.callExpression(
          t.memberExpression(variable, t.identifier("getTime")),
          []
        ),
      ])
    );

    // TODO: is this the best way to get the name of this?
    const name = generate.default(variable).code;
    const ifStatement = t.ifStatement(
      check,
      createTypeExpectationThrow(name, this.type)
    );

    return ifStatement;
  }
}
