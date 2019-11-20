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

test("basic parseArgs", () => {
  const { filter, directives, silent } = parseArgs([
    "**/*.js",
    "--push #ABC",
    "--pull #DEF",
    "--silent",
    "--switch #GHK"
  ])
  expect(filter).toEqual("**/*.js")
  expect(directives).toEqual([
    ["push", "#ABC"],
    ["pull", "#DEF"],
    ["switch", "#GHK"]
  ])
  expect(silent).toEqual(true)
})

test("break the silence", () => {
  const { silent } = parseArgs(["**/*.js", "--push #ABC", "--pull #DEF", "--switch #GHK"])
  expect(silent).toEqual(false)
})

test("basic parseArgs mixed quotes", () => {
  const { filter, directives } = parseArgs(["'**/*.js'", '--push "#ABC"', "--pull '#DEF'", "--switch '#GHK'"])
  expect(filter).toEqual("**/*.js")
  expect(directives).toEqual([
    ["push", "#ABC"],
    ["pull", "#DEF"],
    ["switch", "#GHK"]
  ])
})
