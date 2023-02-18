"use strict";

const { assert, ordinal, escapeRegExp } = require("../src/helper");

test("assert", () => {
  expect(() => assert(false, "help")).toThrow("help");
});

test("!assert", () => {
  expect(() => assert(true, "help")).not.toThrow();
});

test("ordinal", () => {
  const numbers = [...Array(40).keys()].map((a) => a - 20);
  expect(numbers.map(ordinal)).toMatchSnapshot();
});

test("escapeRegExp", () => {
  const readableAsciiChars = [...Array(128).keys()]
    .slice(32)
    .map((i) => String.fromCharCode(i))
    .join("");
  expect(escapeRegExp(readableAsciiChars)).toMatchSnapshot();
});
