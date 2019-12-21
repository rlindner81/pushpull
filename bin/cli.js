#!/usr/bin/env node
"use strict"

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
        log(
          (filters.length === 1 ? `filter ${filters[0]} matches` : `filters ${filters.join(", ")} match`) +
            (filepaths.length === 1 ? ` ${filepaths.length} file` : ` ${filepaths.length} files`)
        )
        return processDirectives(filepaths, directives).then(changes => {
          changes.forEach(({ count, filepath }) => {
            log(`${count} changes in ${filepath}`)
          })
        })
      })
    })
    .catch(err => {
      console.error("error: " + err.message)
    })
})()
