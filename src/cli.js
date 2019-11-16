#!/usr/bin/env node
const { assert, ordinal } = require("./helper")
const processDirectives = require("./directives")
const processFilter = require("./filters")

const args = process.argv.slice(2)

const showUsage = () => {
  console.log(
    `usage: pushpull <filter> [--silent] [--push '<string>'] [--pull '<string>'] [--switch '<string>'] ...

The first argument \`<filter>\` is mandatory. It should filter those files you want to change, i.e., 
* \`.eslintrc.yml\` only the file \`.eslintrc.yml\` in the current directory,
* \`*.yaml\` all files with \`.yaml\` extension in the current directory,
* \`**/*.yaml\` all files with \`.yaml\` extension in the current directory and subdirectories,
* \`config/**/*.js\` all files with \`.js\` extension in all subdirectory of the \`./config\` directory.

The argument \`--silent\` disables all logging. Further arguments have to be directives \`--push\`, \`--pull\`, or \`--switch\` and a (quoted) string. As the name suggests, \`push\` means pushing the string to the end of the line, \`pull\` is the opposite and \`switch\` does both in one pass. The directives are executed on all matching files in the order they are given.
`
  )
}

const parseArgs = args => {
  const filter = args[0]
  let directives = []
  let silent = false
  let parsedOptions = 0
  const rest = args
    .slice(1)
    .join(" ")
    .trim()
    .replace(/--(push|pull|switch|silent)\s*(.*?)\s*(?=$|--(?:push|pull|switch|silent))/g, (_, option, arg) => {
      parsedOptions++
      if (option === "silent") {
        silent = true
        return ""
      }
      assert(arg.length !== 0, `${ordinal(parsedOptions)} option --${option} has no associated string`)

      directives.push([option, arg])
      return ""
    })
  assert(rest.length === 0, `missed (partial) arguments '${rest}'`)
  assert(directives.length !== 0, `need at least one directive`)

  return { filter, directives, silent }
}

const main = () => {
  if (args.length < 1) {
    showUsage()
    process.exit(-1)
  }
  const { filter, directives, silent } = parseArgs(args)
  const log = silent ? () => {} : console.log

  log("filter", filter)
  log("directives", JSON.stringify(directives))
  return processFilter(filter, log).then(filepaths => {
    log("filepaths", filepaths)
    processDirectives(filepaths, directives, log)
  })
}

main()
