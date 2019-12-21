"use strict"

const { processFilters, processDirectives, assert, ordinal, escapeRegExp, noop } = require("../src/")

test("exports", () => {
  expect(processFilters).toBeInstanceOf(Function)
  expect(processDirectives).toBeInstanceOf(Function)
  expect(assert).toBeInstanceOf(Function)
  expect(ordinal).toBeInstanceOf(Function)
  expect(escapeRegExp).toBeInstanceOf(Function)
  expect(noop).toBeInstanceOf(Function)
})
