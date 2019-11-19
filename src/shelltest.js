#!/usr/bin/env node
const { execSync } = require("child_process")

const run = cmd => {
  execSync(cmd, { stdio: "inherit" })
}

const testString = (name, input) => {
  run(`echo ${name} unquoted: ${input}`)
  run(`echo ${name} single-quoted: '${input}'`)
  run(`echo ${name} double-quoted: "${input}"`)
}

console.log(`platform is ${process.platform}`)
testString("expand", "**/*.js")
testString("hash arg", "#ARG")
testString("slash arg", "//ARG")
testString("dash arg ", "--ARG")
