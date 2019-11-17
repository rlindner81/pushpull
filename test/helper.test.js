const { assert, ordinal, escapeRegExp, noop } = require("../src/helper")

test("assert", () => {
  const mockLog = jest.spyOn(console, "error").mockImplementation(noop)
  const mockExit = jest.spyOn(process, "exit").mockImplementation(noop)
  assert(false, "help")
  expect(mockLog).toBeCalledTimes(1)
  expect(mockLog).toBeCalledWith("error: help")
  expect(mockExit).toBeCalledTimes(1)
  expect(mockExit).toBeCalledWith(-1)
})

test("ordinal", () => {
  const numbers = [...Array(200).keys()].map(a => a - 100)
  expect(numbers.map(ordinal)).toMatchSnapshot()
})

test("escapeRegExp", () => {
  const readableAsciiChars = [...Array(128).keys()]
    .slice(32)
    .map(i => String.fromCharCode(i))
    .join("")
  expect(escapeRegExp(readableAsciiChars)).toMatchSnapshot()
})
