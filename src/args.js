const { assert, ordinal } = require("./helper")

const usage = () => {
  return `
usage: pushpull '<filter>' ['<filter>'] [--silent] [--push '<marker>'] [--pull '<marker>'] [--switch '<marker>'] ...

The first \`<filter>\` is mandatory and can be followed by more filters. Filters select files you want to change, i.e., 
* \`.eslintrc.yml\` only the file \`.eslintrc.yml\` in the current directory,
* \`*.yaml\` all files with \`.yaml\` extension in the current directory,
* \`**/*.yaml\` all files with \`.yaml\` extension in the current directory and subdirectories,
* \`config/**/*.js\` all files with \`.js\` extension in all subdirectory of the \`config\` directory.

All arguments with \`--\` are options and start after all filters. The option \`--silent\` disables all logging. Further options have to be directives \`--push\`, \`--pull\`, or \`--switch\` having an associated string \`<marker>\`. As the name suggests, \`push\` means pushing the string to the end of the line, \`pull\` is the opposite and \`switch\` does both in one pass. You can also use the aliases \`--on\` for \`--push\` and \`--off\` for \`--pull\`. The directives are executed on all matching files in the order they are given. Quoting \`<filter>\` and \`<marker>\` helps to be compatible across platforms, because shells tend to _interpret_ these strings.
`
}

const _unquoteArg = arg => {
  return arg.replace(/^'(.+)'$/, "$1").replace(/^"(.+)"$/, "$1")
}

const parseArgs = args => {
  const optionsIndex = args.findIndex(arg => arg.startsWith("--"))
  const filters = (optionsIndex === -1 ? args : args.slice(0, optionsIndex)).map(_unquoteArg)
  let directives = []
  let silent = false

  if (optionsIndex !== -1) {
    let parsedOptions = 0
    const rest = args
      .slice(optionsIndex)
      .join(" ")
      .trim()
      .replace(
        /--(push|pull|on|off|switch|silent)\s*(.*?)\s*(?=$|--(?:push|pull|on|off|switch|silent))/g,
        (_, option, arg) => {
          const unquotedArg = _unquoteArg(arg)
          parsedOptions++
          if (option === "silent") {
            silent = true
            return ""
          }
          assert(unquotedArg.length !== 0, `${ordinal(parsedOptions)} option --${option} has no associated argument`)

          directives.push([option === "on" ? "push" : option === "off" ? "pull" : option, unquotedArg])
          return ""
        }
      )
    assert(rest.length === 0, `missed (partial) arguments '${rest}'`)
  }

  return { filters, directives, silent }
}

module.exports = {
  usage,
  parseArgs
}
