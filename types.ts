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

export type PropertyType =
  | PrimitivePropertyType
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
schemaProperty.array = (memberType: TypeShorthand): ArrayPropertyType => ({
  type: "array",
  valueType: callType(memberType),
});
schemaProperty.object = (objectTypeName: string): ObjectPropertyType => ({
  type: "object",
  objectTypeName,
});

export default schemaProperty;
