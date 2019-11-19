const { assert, ordinal, escapeRegExp, noop } = require("../src/helper")

const mockLog = jest.spyOn(console, "error").mockImplementation(noop)
const mockExit = jest.spyOn(process, "exit").mockImplementation(noop)

test("assert", () => {
  mockLog.mockClear()
  mockExit.mockClear()
  assert(false, "help")
  expect(mockLog).toHaveBeenCalledTimes(1)
  expect(mockLog).toHaveBeenCalledWith("error: help")
  expect(mockExit).toHaveBeenCalledTimes(1)
  expect(mockExit).toHaveBeenCalledWith(-1)
})

test("!assert", () => {
  mockLog.mockClear()
  mockExit.mockClear()
  assert(true, "help")
  expect(mockLog).toHaveBeenCalledTimes(0)
  expect(mockExit).toHaveBeenCalledTimes(0)
})

test("ordinal", () => {
  const numbers = [...Array(40).keys()].map(a => a - 20)
  expect(numbers.map(ordinal)).toMatchSnapshot()
})

test("escapeRegExp", () => {
  const readableAsciiChars = [...Array(128).keys()]
    .slice(32)
    .map(i => String.fromCharCode(i))
    .join("")
  expect(escapeRegExp(readableAsciiChars)).toMatchSnapshot()
})
