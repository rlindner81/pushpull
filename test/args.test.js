"use strict"

const { readFileSync } = require("fs")
const { join } = require("path")
const { usage, parseArgs } = require("../src/args")

test("usagelog", () => {
  const readme = readFileSync(join(__dirname, "..", "README.md")).toString()
  const syntaxRe = /# Usage\n```([\w\W]*?)\n```/
  const usageDoc = syntaxRe.exec(readme)[1]
  const usageLog = usage()
  expect(usageLog).toEqual(usageDoc)
})

test("args basic usage", () => {
  const { filters, directives, silent } = parseArgs([
    "**/*.js",
    "--push #ABC",
    "--pull #DEF",
    "--on #CBA",
    "--off #FDE",
    "--silent",
    "--switch #GHK"
  ])
  expect(filters).toEqual(["**/*.js"])
  expect(directives).toEqual([
    ["push", "#ABC"],
    ["pull", "#DEF"],
    ["push", "#CBA"],
    ["pull", "#FDE"],
    ["switch", "#GHK"]
  ])
  expect(silent).toEqual(true)
})

test("args with silence", () => {
  const { silent } = parseArgs(["**/*.js", "--push #ABC", "--pull #DEF", "--switch #GHK"])
  expect(silent).toEqual(false)
})

test("args with mixed quotes", () => {
  const { filters, directives } = parseArgs(["'**/*.js'", '--push "#ABC"', "--pull '#DEF'", "--switch '#GHK'"])
  expect(filters).toEqual(["**/*.js"])
  expect(directives).toEqual([
    ["push", "#ABC"],
    ["pull", "#DEF"],
    ["switch", "#GHK"]
  ])
})

test("args with multiple filters no directives", () => {
  const { filters, directives } = parseArgs(["a", "b/**", "c.*"])
  expect(filters).toEqual(["a", "b/**", "c.*"])
  expect(directives).toEqual([])
})

test("args with multiple filters and directives", () => {
  const { filters, directives } = parseArgs(["a", "b/**", "c.*", "--push", "#ABC"])
  expect(filters).toEqual(["a", "b/**", "c.*"])
  expect(directives).toEqual([["push", "#ABC"]])
})
