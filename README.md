# PushPull
Convenience tool to make your files' content flexible.

## Install
```
npm install pushpulljs --save-dev
```

## Example
Let's say we don't want the users of some repostiory to update `package-lock.json` with every `npm install`, but we _do_ want to give an easy option `npm run update-lock` for consciously updating it.

With PushPull this is easy. Just add appropriate comments to make your [.npmrc](./.npmrc) flexible.
```
.npmrc
package-lock=false
#WRITE_LOCK package-lock=true

package.json/scripts
{
  "update-lock": "pushpull .npmrc --on '#WRITE_LOCK' && npm i && npm ddp && pushpull .npmrc --off '#WRITE_LOCK'"
}
```

For more examples see [USAGE.md](./USAGE.md).

## Syntax
```
usage: pushpull '<filter>' ['<filter>'] [--silent] [--push '<marker>'] [--pull '<marker>'] [--switch '<marker>'] ...
```
The first `<filter>` is mandatory and can be followed by more filters. Filters select files you want to change, i.e., 
* `.eslintrc.yml` only the file `.eslintrc.yml` in the current directory,
* `*.yaml` all files with `.yaml` extension in the current directory,
* `**/*.yaml` all files with `.yaml` extension in the current directory and subdirectories,
* `config/**/*.js` all files with `.js` extension in all subdirectory of the `config` directory.

All arguments with `--` are options and start after all filters. The option `--silent` disables all logging. Further options have to be directives `--push`, `--pull`, or `--switch` having an associated string `<marker>`. As the name suggests, `push` means pushing the marker to the end of the line, `pull` is the opposite and `switch` does both in one pass. You can also use the aliases `--on` for `--push` and `--off` for `--pull`. The directives are executed on all matching files in the order they are given. Quoting `<filter>` and `<marker>` helps to be compatible across platforms, because shells tend to _interpret_ these strings.

### Notes
* `<filter>` expands with a simplified glob logic that only considers the `*` wildcard
  * `**/` all subdirectories,
  * `*.*` all files (including those starting with `.`),
  * `*.ext` all files with the same extension `.ext`, and
  * `name.*` all files with the same basename `name`
* `<filter>` works with both absolute and relative paths
* `<filter>` will never expand into directories named `node_modules` or `.git`
* `<marker>` can contain `*` wildcards that expand to cover non-whitespace
* `<marker>` can contain literal star `*` characters by using `\*`
* `<marker>` can contain literal backslash `\` characters by using `\\`
