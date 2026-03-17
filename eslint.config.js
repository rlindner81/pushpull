"use strict";

const eslintJs = require("@eslint/js");
const jestPlugin = require("eslint-plugin-jest");
const eslintConfigPrettier = require("eslint-config-prettier");
const globals = require("globals");

module.exports = [
  {
    ignores: ["node_modules/", "coverage/"],
  },
  eslintJs.configs.recommended,
  jestPlugin.configs["flat/recommended"],
  eslintConfigPrettier,
  {
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.es2017,
      },
    },
    rules: {
      strict: ["error"],
    },
  },
];
