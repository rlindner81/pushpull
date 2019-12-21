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

      return processFilters(...filters).then(matchedFilepaths => {
        return processDirectives(matchedFilepaths, directives).then(markerChanges => {
          const matchedFilepathsCount = matchedFilepaths.length
          const markerChangesCount = markerChanges.reduce((prev, cur) => prev + cur.count, 0)
          const markerChangesFilepathsCount = markerChanges.length
          log(
            `moved ${markerChangesCount} marker${
              markerChangesCount === 1 ? "" : "s"
            } in ${markerChangesFilepathsCount} of ${matchedFilepathsCount} matched file${
              matchedFilepathsCount === 1 ? "" : "s"
            }`
          )
        })
      })
    })
    .catch(err => {
      console.error("error: " + err.message)
    })
})()
