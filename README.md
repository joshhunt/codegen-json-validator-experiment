> [!NOTE]  
> Don't take any of this seriously. This was a fun little weekend exercise to experiment with a few things

Completely untested theory. some of these are pretty unconvincing.

- parsing json with typescript is unsafe, and involves blindly trusting that it matches the type you expect.
  - maybe you do trust it. problem solved, you can stop reading :)
- existing "schema validators" have a few downsides:
  - require you to write a schema in its own DSL than 'native' typescript types (e.g. z.schema()...). This creates a mini-lock in, and a mini-language to learn.
  - aren't actually type safe - they deal with `any` and their own runtime checks that typescript can not prove are correct
  - because they involve traversing the custom schema at runtime, they're slower than they can be. runtime parsing is slow.
  - they often involve typescript magic to convert the schema DSL into typescript types, which can slow down typescript checks for your project
    - slow typechecking in CI is annoying, but not the end of the world.
    - slow typechecking in your editor is a dealbreaker for me.
- if you're already using some codegen to go from, for example, openapi to zod, why not instead just generate 'zod' and skip its runtime completely?

Instead:

- we can _generate_ schema validator functions that accept `input: unknown`, and use typescript's native type refinement to prove that the input is valid.
- similar to loop unrolling, the idea is to generate code that does the zod-like validation
- code should use zero `any` or type assertions - everything should be provable by typescript
- runtime validation libraries incur a static size cost. not matter the size of your schema, you're paying for the entire library.
- generated code is linearly proportional to the size of the schema. the smaller your schema, the smaller your validation code will be
  - there exists a threshold where the generated code is larger than the runtime library and this no longer becomes a benefit
  - generated code is more easily tree-shakeable, so it is less expensive to just generate all of your schemas and then use only what you need.
- generated code is (theoretically) faster than runtime validation, because it is just a bunch of `if` statements. no need to traverse the schema at runtime.
- a downside is that it can only validate what typescript can prove.
  - this means, for example, no regex validation or number range validation. that would be left to the user to add their own additional checks?

What's there at the moment:

- `run.ts` that generates a `validate` function for a given schema, using an "internal" schema format.
  - ideally, it would take openapi or even typescript interfaces as the input format
- schema types:
  - primitives like string, number, boolean
  - date. can be parsed from a string, or Date object
  - array. can be an array of any other type
  - object. can only reference another "named" schema (not an inline object)
  - optional properties
- unsupported/todo:
  - inline objects
  - enums
  - unions
  - tuples

I would like to benchmark performance against other popular runtime validation libraries, but becuase this generator supports so few types at the moment
I feel like that would be pretty unfair to the other libraries. Though, it would be interesting if even this limited set of types, the other libraries are faster.


---

Similar approaches (that i found after the fact, otherwise i probably woudln't have tried this):
 - https://typia.io/docs/validators/assert/ basically roughly exactly the same as this (except, with actual features)

