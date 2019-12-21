"use strict"

jest.mock("fs")
const fs = require("fs")
const processDirectives = require("../src/directives")

const mockReadFile = jest.spyOn(fs, "readFile")
const mockWriteFile = jest.spyOn(fs, "writeFile")

const mockDirectives = (input, directives) => {
  let result = null
  mockReadFile.mockImplementation((_, cb) => {
    cb(null, input)
  })
  mockWriteFile.mockImplementation((_, data, cb) => {
    result = data
    cb(null)
  })
  return processDirectives(["_"], directives).then(() => {
    return result
  })
}

beforeEach(() => {
  mockReadFile.mockClear()
  mockWriteFile.mockClear()
})

test("process bad directive", () => {
  return expect(() => mockDirectives("   # 123 alalalasdas   ", [["bad", "# 123"]])).toThrowErrorMatchingSnapshot()
})

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

test("process wildcard markers", () => {
  return mockDirectives(
    `
    rog=true #ROG
    registry=https://registry.npmjs.org #REG_NPM
    registry=https://npm.pkg.github.com #REG_GITHUB
    registry=a #REG_A
    registry=b #REG_B
    #REG_C registry=c
`,
    [
      ["pull", "#REG*"],
      ["push", "#REG*GITHUB"]
    ]
  ).then(result => {
    expect(result).toEqual(`
    rog=true #ROG
    #REG_NPM registry=https://registry.npmjs.org
    registry=https://npm.pkg.github.com #REG_GITHUB
    #REG_A registry=a
    #REG_B registry=b
    #REG_C registry=c
`)
  })
})

test("process escaping", () => {
  const testSet = `
    a \\
    b \\\\
    c \\*
    d \\\\*
    e *
`
  return Promise.resolve()
    .then(() => mockDirectives(testSet, [["pull", "\\\\\\*"]]))
    .then(result =>
      expect(result).toEqual(`
    a \\
    b \\\\
    \\* c
    d \\\\*
    e *
`)
    )
    .then(() => mockDirectives(testSet, [["pull", "\\\\*"]]))
    .then(result =>
      expect(result).toEqual(`
    \\ a
    \\\\ b
    \\* c
    \\\\* d
    e *
`)
    )
    .then(() => mockDirectives(testSet, [["pull", "\\*"]]))
    .then(result =>
      expect(result).toEqual(`
    a \\
    b \\\\
    c \\*
    d \\\\*
    * e
`)
    )
})

test("allow markers with slashes", () => {
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

test("don't push past line end", () => {
  const testSet = `
    aaa
    bbb
    ccc
`
  return Promise.resolve()
    .then(() => mockDirectives(testSet, [["push", "aaa"]]))
    .then(result => expect(result).toEqual(null))
})

test("don't exchange with whitespace", () => {
  const testSet = `    aaa  `
  return Promise.resolve()
    .then(() => mockDirectives(testSet, [["pull", "aaa"]]))
    .then(result => expect(result).toEqual(null))
})

test("usage multiline comments", () => {
  return mockDirectives(
    `
  <option>deleteall</option> <!--DELETE
  -->
`,
    [["pull", "<!--DELETE"]]
  ).then(result => {
    expect(result).toEqual(`
  <!--DELETE <option>deleteall</option>
  -->
`)
  })
})

test("usage markers with wildcards", () => {
  return mockDirectives(
    `
    registry=https://registry.npmjs.org #REG_NPM
    #REG_GITHUB registry=https://npm.pkg.github.com
    #REG_CUSTOM registry=https://npm.company.com
`,
    [
      ["pull", "#REG*"],
      ["push", "#REG*CUSTOM"]
    ]
  ).then(result => {
    expect(result).toEqual(`
    #REG_NPM registry=https://registry.npmjs.org
    #REG_GITHUB registry=https://npm.pkg.github.com
    registry=https://npm.company.com #REG_CUSTOM
`)
  })
})

test("usage markers with escaped wildcard", () => {
  return mockDirectives(
    `
    const win=true /*WIN
    */
`,
    [["pull", "/\\*WIN"]]
  ).then(result => {
    expect(result).toEqual(`
    /*WIN const win=true
    */
`)
  })
})

test("usage markers with literal backslash", () => {
  return Promise.resolve()
    .then(() => mockDirectives(`const win=true \\\\WIN`, [["pull", "\\\\\\\\WIN"]]))
    .then(result => expect(result).toEqual(`\\\\WIN const win=true`))
    .then(() => mockDirectives(`const win=true \\\\WIN`, [["pull", "\\\\\\\\*"]]))
    .then(result => expect(result).toEqual(`\\\\WIN const win=true`))
})
