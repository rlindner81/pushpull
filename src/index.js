"use strict";

const processDirectives = require("./directives");
const processFilters = require("./filter");
const helper = require("./helper");

module.exports = {
  processFilters,
  processDirectives,
  ...helper,
};
