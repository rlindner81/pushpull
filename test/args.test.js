const { readFileSync } = require("fs")
const { join } = require("path")
const { usage, parseArgs } = require("../src/args")

test("usagelog", () => {
  const readme = readFileSync(join(__dirname, "..", "README.md")).toString()
  const syntaxRe = /# Syntax\n([\w\W]*?)\n### Notes/
  const usageDoc = syntaxRe.exec(readme)[1].replace(/```/g, "")
  const usageLog = usage()
  expect(usageLog).toEqual(usageDoc)
})
