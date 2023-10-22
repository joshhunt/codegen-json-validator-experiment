import { expect } from "@jest/globals";
import generator from "@babel/generator";

expect.extend({
  toMatchCode(recieved: any, expected: any) {
    const code = generator.default(recieved).code;
    return code === expected
      ? {
          pass: true,
          message: () => `Expected '${code}' not to match '${expected}'`,
        }
      : {
          pass: false,
          message: () => `Expected '${code}' to match '${expected}'`,
        };
  },
});
