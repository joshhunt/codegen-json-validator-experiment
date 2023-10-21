interface Hello {
  name: string;
  age: number;
  "foo-bar": number;
  world: World;
}

function parseHello(input: unknown): Hello {
  if (typeof input !== "object" || input === null) {
    throw new Error("Expected object");
  }

  let name: string;
  if ("name" in input && typeof input.name === "string") {
    name = input.name;
  } else {
    throw new Error("Expected valid name");
  }

  let age: number;
  if ("age" in input && typeof input.age === "number") {
    age = input.age;
  } else {
    throw new Error("Expected valid age");
  }

  let p3_foobar: number;
  if ("foo-bar" in input && typeof input["foo-bar"] === "number") {
    p3_foobar = input["foo-bar"];
  } else {
    throw new Error("Expected valid foo-bar");
  }

  let world: World;
  if (
    "world" in input &&
    typeof input.world === "object" &&
    input.world !== null
  ) {
    world = parseWorld(input.world);
  } else {
    throw new Error("Expected valid world");
  }

  return {
    name,
    age,
    ["foo-bar"]: p3_foobar,
    world,
  };
}

interface World {
  foo: string;
  bar: number;
  baz: boolean;
}

function parseWorld(input: unknown): World {
  if (typeof input !== "object" || input === null) {
    throw new Error("Expected object");
  }

  let foo: string;
  if ("foo" in input && typeof input.foo === "string") {
    foo = input.foo;
  } else {
    throw new Error("Expected valid foo");
  }

  let bar: number;
  if ("bar" in input && typeof input.bar === "number") {
    bar = input.bar;
  } else {
    throw new Error("Expected valid bar");
  }

  let baz: boolean;
  if ("baz" in input && typeof input.baz === "boolean") {
    baz = input.baz;
  } else {
    throw new Error("Expected valid baz");
  }

  return {
    foo,
    bar,
    baz,
  };
}
