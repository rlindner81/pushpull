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
