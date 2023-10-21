interface Hello {
  name: string;
  age: number;
  "foo-bar": number;
  world: World;
  "wowee-is-optional"?: Wowee;
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

  let p5_woweeisoptional: Wowee | undefined = undefined;
  if (
    "wowee-is-optional" in input &&
    typeof input["wowee-is-optional"] === "object" &&
    input["wowee-is-optional"] !== null
  ) {
    p5_woweeisoptional = parseWowee(input["wowee-is-optional"]);
  }

  return {
    name,
    age,
    ["foo-bar"]: p3_foobar,
    world,
    ["wowee-is-optional"]: p5_woweeisoptional,
  };
}

interface World {
  foo: string;
  bar: number;
  baz: boolean;
  optionalFoo?: string;
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

  let optionalFoo: string | undefined = undefined;
  if ("optionalFoo" in input && typeof input.optionalFoo === "string") {
    optionalFoo = input.optionalFoo;
  }

  return {
    foo,
    bar,
    baz,
    optionalFoo,
  };
}

interface Wowee {
  beep: number;
  boop: boolean;
}

function parseWowee(input: unknown): Wowee {
  if (typeof input !== "object" || input === null) {
    throw new Error("Expected object");
  }

  let beep: number;
  if ("beep" in input && typeof input.beep === "number") {
    beep = input.beep;
  } else {
    throw new Error("Expected valid beep");
  }

  let boop: boolean;
  if ("boop" in input && typeof input.boop === "boolean") {
    boop = input.boop;
  } else {
    throw new Error("Expected valid boop");
  }

  return {
    beep,
    boop,
  };
}
