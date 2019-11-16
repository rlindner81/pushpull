jest.mock("fs")
const fs = require("fs")
const processDirectives = require("../src/directives")

const mockDirectives = (input, directives) => {
  let result = null
  fs.readFile.mockImplementationOnce((_, cb) => {
    cb(null, input)
  })
  fs.writeFile.mockImplementationOnce((_, data, cb) => {
    result = data
    cb(null)
  })
  return processDirectives(["_"], directives).then(() => result)
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

test("don't change partial back matches with prefixes", () => {
  return mockDirectives("alalalasdas // lalala // A_LALA", [["switch", "// LALA"]]).then(result => {
    expect(result).toEqual(null)
  })
})

test("don't change partial back matches with suffixes", () => {
  return mockDirectives("alalalasdas // lalala // LALA_A", [["switch", "// LALA"]]).then(result => {
    expect(result).toEqual(null)
  })
})

test("don't change partial front matches with prefixes", () => {
  return mockDirectives("// A_LALA alalalasdas // lalala", [["switch", "// LALA"]]).then(result => {
    expect(result).toEqual(null)
  })
})

test("don't change partial front matches with suffixes", () => {
  return mockDirectives("// LALA_A alalalasdas // lalala", [["switch", "// LALA"]]).then(result => {
    expect(result).toEqual(null)
  })
})
