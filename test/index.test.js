const { processFilter, processDirectives, assert, ordinal, escapeRegExp, noop } = require("../src/")

test("exports", () => {
  expect(processFilter).toBeInstanceOf(Function)
  expect(processDirectives).toBeInstanceOf(Function)
  expect(assert).toBeInstanceOf(Function)
  expect(ordinal).toBeInstanceOf(Function)
  expect(escapeRegExp).toBeInstanceOf(Function)
  expect(noop).toBeInstanceOf(Function)
})
