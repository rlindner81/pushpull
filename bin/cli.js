#!/usr/bin/env node
const { usage, parseArgs } = require("../src/args")
const { processDirectives, processFilters, noop } = require("../src/")

const args = process.argv.slice(2)

;(() => {
  if (args.length < 1) {
    console.log(usage())
    process.exit(-1)
  }
  Promise.resolve()
    .then(() => {
      const { filters, directives, silent } = parseArgs(args)
      const log = silent ? noop : console.log

      return processFilters(...filters).then(filepaths => {
        log(`filter(s) ${filters.join(", ")} match ${filepaths.length} file(s)`)
        return processDirectives(filepaths, directives, log)
      })
    })
    .catch(err => {
      console.error("error: " + err.message)
    })
})()
