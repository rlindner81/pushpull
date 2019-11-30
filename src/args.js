const { assert, ordinal } = require("./helper")

const usage = () => {
  return `
usage: pushpull '<filter>' [--silent] [--push '<marker>'] [--pull '<marker>'] [--switch '<marker>'] ...

The first option \`<filter>\` is mandatory. It should filter those files you want to change, i.e., 
* \`.eslintrc.yml\` only the file \`.eslintrc.yml\` in the current directory,
* \`*.yaml\` all files with \`.yaml\` extension in the current directory,
* \`**/*.yaml\` all files with \`.yaml\` extension in the current directory and subdirectories,
* \`config/**/*.js\` all files with \`.js\` extension in all subdirectory of the \`config\` directory.

The option \`--silent\` disables all logging. Further options have to be directives \`--push\`, \`--pull\`, or \`--switch\` having an associated string argument \`<marker>\`. As the name suggests, \`push\` means pushing the string to the end of the line, \`pull\` is the opposite and \`switch\` does both in one pass. The directives are executed on all matching files in the order they are given. Quoting \`<filter>\` and \`<marker>\` helps to be compatible across platforms, because shells tend to _interpret_ these strings.
`
}

const _unquoteArg = arg => {
  return arg.replace(/^'(.+)'$/, "$1").replace(/^"(.+)"$/, "$1")
}

const parseArgs = args => {
  const directivesIndex = args.findIndex(arg => arg.startsWith("--"))
  const filters = args.slice(0, directivesIndex).map(_unquoteArg)
  let directives = []
  let silent = false
  let parsedOptions = 0
  const rest = args
    .slice(directivesIndex)
    .join(" ")
    .trim()
    .replace(/--(push|pull|switch|silent)\s*(.*?)\s*(?=$|--(?:push|pull|switch|silent))/g, (_, option, arg) => {
      const unquotedArg = _unquoteArg(arg)
      parsedOptions++
      if (option === "silent") {
        silent = true
        return ""
      }
      assert(unquotedArg.length !== 0, `${ordinal(parsedOptions)} option --${option} has no associated argument`)

      directives.push([option, unquotedArg])
      return ""
    })
  assert(rest.length === 0, `missed (partial) arguments '${rest}'`)

  return { filters, directives, silent }
}

module.exports = {
  usage,
  parseArgs
}
