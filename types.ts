interface BaseSchemaProperty {
  name: string;
}

interface PrimitiveSchemaProperty extends BaseSchemaProperty {
  type: "string" | "number" | "boolean";
}

interface ObjectSchemaProperty extends BaseSchemaProperty {
  type: "object";
  objectTypeName: string;
}

type SchemaProperty = PrimitiveSchemaProperty | ObjectSchemaProperty;

export interface Schema {
  name: string;
  type: "object";
  properties: SchemaProperty[];
}

export interface PropertyNameVariableMapping {
  variableName: string;
  propertyName: string;
}
