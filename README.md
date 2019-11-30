# PushPull
Convenience tool to make your files' content flexible.

# Install
```
npm install pushpulljs --save-dev
```

# Example
Let's say we don't want the users of some repostiory to update `package-lock.json` with every `npm install`, but we _do_ want to give an easy option `npm run update-package-lock` for consciously updating it.

With PushPull this is easy. Just add appropriate comments to make your [.npmrc](./.npmrc) flexible.
```
.npmrc
package-lock=false #UPDATE_OFF
#UPDATE_ON package-lock=true

package.json/scripts
{
  "update-package-lock": "pushpull .npmrc --push '#UPDATE_ON' --pull '#UPDATE_OFF' && npm install && npm dedupe && pushpull .npmrc --push '#UPDATE_OFF' --pull '#UPDATE_ON'"
}
```

For this easy case, the `switch` directive would be even more appropriate. It does both `push` and `pull` of the same string in one pass.
```
.npmrc
package-lock=false #UPDATE
#UPDATE package-lock=true

package.json/scripts
{
  "update-package-lock": "pushpull .npmrc --switch '#UPDATE' && npm install && npm dedupe && pushpull .npmrc --switch '#UPDATE'"
}
```

# Syntax
```
usage: pushpull '<filter>' ['<filter>'] [--silent] [--push '<marker>'] [--pull '<marker>'] [--switch '<marker>'] ...
```
The first `<filter>` is mandatory and can be followed by more filters. Filters select files you want to change, i.e., 
* `.eslintrc.yml` only the file `.eslintrc.yml` in the current directory,
* `*.yaml` all files with `.yaml` extension in the current directory,
* `**/*.yaml` all files with `.yaml` extension in the current directory and subdirectories,
* `config/**/*.js` all files with `.js` extension in all subdirectory of the `config` directory.

All arguments with `--` are options and start after all filters. The option `--silent` disables all logging. Further options have to be directives `--push`, `--pull`, or `--switch` having an associated string `<marker>`. As the name suggests, `push` means pushing the string to the end of the line, `pull` is the opposite and `switch` does both in one pass. The directives are executed on all matching files in the order they are given. Quoting `<filter>` and `<marker>` helps to be compatible across platforms, because shells tend to _interpret_ these strings.

### Notes
* `<filter>` expands with a simplified glob logic that only considers the `*` wildcard
  * `**/` all subdirectories,
  * `*.*` all files (including those starting with `.`),
  * `*.ext` all files with the same extension `.ext`, and
  * `name.*` all files with the same basename `name`
* `<filter>` works with both absolute and relative paths
* `<filter>` will never expand into directories named `node_modules` or `.git`
