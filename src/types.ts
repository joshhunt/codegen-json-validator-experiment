import * as t from "@babel/types";

export type Narrowable = t.Identifier | t.MemberExpression;

export interface PrimitivePropertyType {
  type: "string" | "number" | "boolean";
}

export interface ObjectPropertyType {
  type: "object";
  objectTypeName: string;
}

export interface ArrayPropertyType {
  type: "array";
  valueType: PropertyType;
}

export interface DatePropertyType {
  type: "date";
}

export type PropertyType =
  | PrimitivePropertyType
  | DatePropertyType
  | ObjectPropertyType
  | ArrayPropertyType;

export interface SchemaProperty {
  name: string;
  type: PropertyType;
  optional?: boolean;
}

export interface Schema {
  name: string;
  type: "object";
  properties: SchemaProperty[];
}

type TypeShorthand = PropertyType | (() => PropertyType);

export interface SchemaPropertyDefinition {
  name: string;
  narrowCheck: (variable: Narrowable, type: PropertyType) => t.Expression;
  cast: (variable: Narrowable, type: PropertyType) => t.Expression;
}

function callType(type: TypeShorthand) {
  return typeof type === "function" ? type() : type;
}

function schemaProperty(name: string, type: TypeShorthand): SchemaProperty {
  return { name, type: callType(type) };
}

schemaProperty.optional = (prop: SchemaProperty) => {
  prop.optional = true;
  return prop;
};

schemaProperty.string = (): PrimitivePropertyType => ({ type: "string" });
schemaProperty.number = (): PrimitivePropertyType => ({ type: "number" });
schemaProperty.boolean = (): PrimitivePropertyType => ({ type: "boolean" });
schemaProperty.date = (): DatePropertyType => ({ type: "date" });
schemaProperty.array = (memberType: TypeShorthand): ArrayPropertyType => ({
  type: "array",
  valueType: callType(memberType),
});
schemaProperty.object = (objectTypeName: string): ObjectPropertyType => ({
  type: "object",
  objectTypeName,
});

export default schemaProperty;
