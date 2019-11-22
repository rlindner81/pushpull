const processDirectives = require("./directives")
const processFilter = require("./filter")
const helper = require("./helper")

module.exports = {
  processFilter,
  processDirectives,
  ...helper
}
