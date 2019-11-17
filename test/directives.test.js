jest.mock("fs")
const { readFile, writeFile } = require("fs")
const processDirectives = require("../src/directives")

const mockDirectives = (input, directives) => {
  let result = null
  readFile.mockImplementation((_, cb) => {
    cb(null, input)
  })
  writeFile.mockImplementation((_, data, cb) => {
    result = data
    cb(null)
  })
  return processDirectives(["_"], directives).then(() => {
    return result
  })
}

test("process push directive", () => {
  return mockDirectives("   # 123 alalalasdas   ", [["push", "# 123"]]).then(result => {
    expect(result).toEqual("   alalalasdas # 123   ")
  })
})

test("process pull directive", () => {
  return mockDirectives("   alalalasdas # 123   ", [["pull", "# 123"]]).then(result => {
    expect(result).toEqual("   # 123 alalalasdas   ")
  })
})

test("process switch directive", () => {
  return mockDirectives(
    `   alalalasdas # 123   
   # 123 alalalasdas   `,
    [["switch", "# 123"]]
  ).then(result => {
    expect(result).toEqual(
      `   # 123 alalalasdas   
   alalalasdas # 123   `
    )
  })
})

test("allow string with slashes", () => {
  return mockDirectives("   alalalasdas // lalala // 123   ", [["switch", "// 123"]]).then(result => {
    expect(result).toEqual("   // 123 alalalasdas // lalala   ")
  })
})

test("don't push/switch partial front matches with prefixes", () => {
  return mockDirectives("A_// LALA alalalasdas // lalala", [
    ["push", "// LALA"],
    ["switch", "// LALA"]
  ]).then(result => {
    expect(result).toEqual(null)
  })
})

test("don't push/switch partial front matches with suffixes", () => {
  return mockDirectives("// LALA_A alalalasdas // lalala", [
    ["push", "// LALA"],
    ["switch", "// LALA"]
  ]).then(result => {
    expect(result).toEqual(null)
  })
})

test("don't pull/switch partial back matches with prefixes", () => {
  return mockDirectives("alalalasdas // lalala A_// LALA", [
    ["pull", "// LALA"],
    ["switch", "// LALA"]
  ]).then(result => {
    expect(result).toEqual(null)
  })
})

test("don't pull/switch partial back matches with suffixes", () => {
  return mockDirectives("alalalasdas // lalala // LALA_A", [
    ["pull", "// LALA"],
    ["switch", "// LALA"]
  ]).then(result => {
    expect(result).toEqual(null)
  })
})
