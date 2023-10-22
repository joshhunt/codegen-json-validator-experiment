interface Hello {
  name: string;
  age: number;
  "is-handsome": boolean;
  dateOfBirth: Date;
  world: World;
  optionalWorld?: World;
  arrayOfNumbers: number[];
  arrayOfObjects: World[];
  arrayOfArrayofNumbers: number[][];
}

export function parseHello(input: unknown): Hello {
  if (typeof input !== "object" || input === null) {
    throw new Error("Expected object");
  }

  let name: string;
  if ("name" in input && typeof input.name === "string") {
    name = input.name;
  } else {
    throw new Error("Expected name to be a valid string");
  }

  let age: number;
  if ("age" in input && typeof input.age === "number") {
    age = input.age;
  } else {
    throw new Error("Expected age to be a valid number");
  }

  let p3_ishandsome: boolean;
  if ("is-handsome" in input && typeof input["is-handsome"] === "boolean") {
    p3_ishandsome = input["is-handsome"];
  } else {
    throw new Error("Expected is-handsome to be a valid boolean");
  }

  let dateOfBirth: Date;
  if (
    "dateOfBirth" in input &&
    (typeof input.dateOfBirth === "string" || input.dateOfBirth instanceof Date)
  ) {
    dateOfBirth =
      input.dateOfBirth instanceof Date ? input.dateOfBirth : new Date(input.dateOfBirth);

    if (!isNaN(dateOfBirth.getTime())) {
      throw new Error("Expected dateOfBirth to be a valid date");
    }
  } else {
    throw new Error("Expected dateOfBirth to be a valid date");
  }

  let world: World;
  if ("world" in input && typeof input.world === "object" && input.world !== null) {
    world = parseWorld(input.world);
  } else {
    throw new Error("Expected world to be a valid object(World)");
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
    arrayOfNumbers = input.arrayOfNumbers.map((arrayOfNumbersItem: unknown) => {
      if (typeof arrayOfNumbersItem === "number") {
        return arrayOfNumbersItem;
      } else {
        throw new Error("Expected arrayOfNumbersItem to be a valid number");
      }
    });
  } else {
    throw new Error("Expected arrayOfNumbers to be a valid array(number)");
  }

  let arrayOfObjects: World[];
  if ("arrayOfObjects" in input && Array.isArray(input.arrayOfObjects)) {
    arrayOfObjects = input.arrayOfObjects.map((arrayOfObjectsItem: unknown) => {
      if (typeof arrayOfObjectsItem === "object" && arrayOfObjectsItem !== null) {
        return parseWorld(arrayOfObjectsItem);
      } else {
        throw new Error("Expected arrayOfObjectsItem to be a valid object(World)");
      }
    });
  } else {
    throw new Error("Expected arrayOfObjects to be a valid array(object(World))");
  }

  let arrayOfArrayofNumbers: number[][];
  if ("arrayOfArrayofNumbers" in input && Array.isArray(input.arrayOfArrayofNumbers)) {
    arrayOfArrayofNumbers = input.arrayOfArrayofNumbers.map(
      (arrayOfArrayofNumbersItem: unknown) => {
        if (Array.isArray(arrayOfArrayofNumbersItem)) {
          return arrayOfArrayofNumbersItem.map((arrayOfArrayofNumbersItemItem: unknown) => {
            if (typeof arrayOfArrayofNumbersItemItem === "number") {
              return arrayOfArrayofNumbersItemItem;
            } else {
              throw new Error("Expected arrayOfArrayofNumbersItemItem to be a valid number");
            }
          });
        } else {
          throw new Error("Expected arrayOfArrayofNumbersItem to be a valid array(number)");
        }
      },
    );
  } else {
    throw new Error("Expected arrayOfArrayofNumbers to be a valid array(array(number))");
  }

  return {
    name,
    age,
    ["is-handsome"]: p3_ishandsome,
    dateOfBirth,
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
  validDates: Date[];
}

export function parseWorld(input: unknown): World {
  if (typeof input !== "object" || input === null) {
    throw new Error("Expected object");
  }

  let foo: string;
  if ("foo" in input && typeof input.foo === "string") {
    foo = input.foo;
  } else {
    throw new Error("Expected foo to be a valid string");
  }

  let bar: number;
  if ("bar" in input && typeof input.bar === "number") {
    bar = input.bar;
  } else {
    throw new Error("Expected bar to be a valid number");
  }

  let baz: boolean;
  if ("baz" in input && typeof input.baz === "boolean") {
    baz = input.baz;
  } else {
    throw new Error("Expected baz to be a valid boolean");
  }

  let optionalFoo: string | undefined = undefined;
  if ("optionalFoo" in input && typeof input.optionalFoo === "string") {
    optionalFoo = input.optionalFoo;
  }

  let validDates: Date[];
  if ("validDates" in input && Array.isArray(input.validDates)) {
    validDates = input.validDates.map((validDatesItem: unknown) => {
      if (typeof validDatesItem === "string" || validDatesItem instanceof Date) {
        const temp = validDatesItem instanceof Date ? validDatesItem : new Date(validDatesItem);

        if (!isNaN(temp.getTime())) {
          throw new Error("Expected temp to be a valid date");
        }

        return temp;
      } else {
        throw new Error("Expected validDatesItem to be a valid date");
      }
    });
  } else {
    throw new Error("Expected validDates to be a valid array(date)");
  }

  return {
    foo,
    bar,
    baz,
    optionalFoo,
    validDates,
  };
}
