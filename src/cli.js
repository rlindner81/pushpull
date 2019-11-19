#!/usr/bin/env node
const { usage, parseArgs } = require("./args");
const processDirectives = require("./directives");
const processFilter = require("./filter");
const { noop } = require("./helper");

const args = process.argv.slice(2);

(() => {
  if (args.length < 1) {
    console.log(usage());
    process.exit(-1);
  }
  const { filter, directives, silent } = parseArgs(args);
  const log = silent ? noop : console.log;

  return processFilter(filter).then(filepaths => {
    log(`filter ${filter} matches ${filepaths.length} file(s)`);
    return processDirectives(filepaths, directives, log);
  });
})();
