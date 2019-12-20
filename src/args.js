"use strict"

const { assert, ordinal } = require("./helper")

const usage = () => `
usage: pushpull '<files>' [<options>] [<directives>]

options:
  --silent             disable logging

directives:
  --push '<marker>'    push all instances of marker on the start of any line to the end
  --pull '<marker>'    pull all instances of marker from the end of any line to the start
  --switch '<marker>'  apply both push and pull in one pass
  --on '<marker>'      alias for push
  --off '<marker>'     alias for pull

examples:
  pushpull '.npmrc' --on '#WRITE_LOCK'
  pushpull '**/*.js' --off '//DEBUG'
  pushpull 'config/**/*.yaml' 'config/**/.*rc' --silent --off '#OPTIONAL*'
`

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
