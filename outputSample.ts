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

  let name;

  if ("name" in input && typeof input.name === "string") {
    name = input.name;
  } else {
    throw new Error("Expected valid name");
  }

  let age;

  if ("age" in input && typeof input.age === "number") {
    age = input.age;
  } else {
    throw new Error("Expected valid age");
  }

  let p2_foobar;

  if ("foo-bar" in input && typeof input["foo-bar"] === "number") {
    p2_foobar = input["foo-bar"];
  } else {
    throw new Error("Expected valid foo-bar");
  }

  let world;

  if ("world" in input && typeof input.world === "object" && world !== null) {
    world = parseWorld(input.world);
  } else {
    throw new Error("Expected valid world");
  }

  return {
    name,
    age,
    ["foo-bar"]: p2_foobar,
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

  let foo;

  if ("foo" in input && typeof input.foo === "string") {
    foo = input.foo;
  } else {
    throw new Error("Expected valid foo");
  }

  let bar;

  if ("bar" in input && typeof input.bar === "number") {
    bar = input.bar;
  } else {
    throw new Error("Expected valid bar");
  }

  let baz;

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
