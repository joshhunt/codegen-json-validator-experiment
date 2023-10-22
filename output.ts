interface Hello {
  name: string;
  age: number;
  "is-handsome": boolean;
  world: World;
  optionalWorld?: World;
  arrayOfNumbers: number[];
  arrayOfObjects: World[];
  arrayOfArrayofNumbers: number[][];
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

  let p3_ishandsome: boolean;
  if ("is-handsome" in input && typeof input["is-handsome"] === "boolean") {
    p3_ishandsome = input["is-handsome"];
  } else {
    throw new Error("Expected valid is-handsome");
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

  let optionalWorld: World | undefined = undefined;
  if (
    "optionalWorld" in input &&
    typeof input.optionalWorld === "object" &&
    input.optionalWorld !== null
  ) {
    optionalWorld = parseWorld(input.optionalWorld);
  }

  let arrayOfNumbers: number[];
  if ("arrayOfNumbers" in input && Array.isArray(input.arrayOfNumbers)) {
    arrayOfNumbers = input.arrayOfNumbers.map((item: unknown) => {
      if (typeof item === "number") {
        return item;
      } else {
        throw new Error("Expected valid item");
      }
    });
  } else {
    throw new Error("Expected valid arrayOfNumbers");
  }

  let arrayOfObjects: World[];
  if ("arrayOfObjects" in input && Array.isArray(input.arrayOfObjects)) {
    arrayOfObjects = input.arrayOfObjects.map((item: unknown) => {
      if (typeof item === "object" && item !== null) {
        return parseWorld(item);
      } else {
        throw new Error("Expected valid item");
      }
    });
  } else {
    throw new Error("Expected valid arrayOfObjects");
  }

  let arrayOfArrayofNumbers: number[][];
  if (
    "arrayOfArrayofNumbers" in input &&
    Array.isArray(input.arrayOfArrayofNumbers)
  ) {
    arrayOfArrayofNumbers = input.arrayOfArrayofNumbers.map((item: unknown) => {
      if (Array.isArray(item)) {
        return item.map((item: unknown) => {
          if (typeof item === "number") {
            return item;
          } else {
            throw new Error("Expected valid item");
          }
        });
      } else {
        throw new Error("Expected valid item");
      }
    });
  } else {
    throw new Error("Expected valid arrayOfArrayofNumbers");
  }

  return {
    name,
    age,
    ["is-handsome"]: p3_ishandsome,
    world,
    optionalWorld,
    arrayOfNumbers,
    arrayOfObjects,
    arrayOfArrayofNumbers,
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
