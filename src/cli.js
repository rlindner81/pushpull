#!/usr/bin/env node
const { assert, ordinal } = require("./helper")
const processDirectives = require("./directives")
const processFilter = require("./filters")

const args = process.argv.slice(2)

const showUsage = () => {
  console.log(
    `usage: pushpull <filter> [--push '<string>'] [--pull '<string>'] [--switch '<string>'] ...

The first argument \`<filter>\` is mandatory. It should filter those files you want to change, i.e., 
* \`.eslintrc.yml\` only the file \`.eslintrc.yml\` in the current directory,
* \`*.yaml\` all files with \`.yaml\` extension in the current directory,
* \`**/*.yaml\` all files with \`.yaml\` extension in the current directory and subdirectories,
* \`config/**/*.js\` all files with \`.js\` extension in all subdirectory of the \`./config\` directory.

All further arguments have to be directives \`--push\`, \`--pull\`, or \`--switch\` and a (quoted) string. As the name suggests, \`push\` means pushing the string to the end of the line, \`pull\` is the opposite and \`switch\` does both in one pass. The directives are executed in the order they are given.
`
  )
}

const parseArgs = args => {
  const filter = args[0]
  let directives = []
  const rest = args
    .slice(1)
    .join(" ")
    .trim()
    .replace(/--(push|pull|switch)\s*(.*?)\s*(?=$|--push|--pull|--switch)/g, (_, directive, string) => {
      assert(string.length !== 0, `${ordinal(directives.length + 1)} directive --${directive} has no associated string`)

      directives.push([directive, string])
      return ""
    })
  assert(rest.length === 0, `missed (partial) directive arguments '${rest}'`)
  assert(directives.length !== 0, `need at least one directive`)

  return { filter, directives }
}

const main = () => {
  if (args.length < 1) {
    showUsage()
    process.exit(-1)
  }
  const { filter, directives } = parseArgs(args)
  console.log("filter", filter)
  return processFilter(filter).then(filepaths => {
    console.log("filepaths", filepaths)
    console.log("directives", JSON.stringify(directives))
    processDirectives(filepaths, directives)
  })
}

main()
