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

## Usage
```
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
  pushpull '**/*.js' --pull '//DEBUG'
  pushpull 'config/**/*.yaml' 'config/**/.*rc' --silent --off '#OPTIONAL*'

```
For more detailed examples see [USAGE.md](./USAGE.md).

### Notes
* quoting `<files>` and `<marker>` helps to be compatible across platforms
* `<directives>` are applied in the order they are given
* `<files>` expands `*` wildcards with a simplified glob logic
  * `**/` matches all subdirectories
  * `*.*` matches all files (including those starting with `.`)
  * `*.ext` matches files with the extension `.ext`
  * `name.*` matches files with the basename `name`
* `<filter>` works with both absolute and relative paths
* `<filter>` will never expand into directories named `node_modules` or `.git`
* `<marker>` expands `*` wildcards to cover non-whitespace
* `<marker>` can contain literal star `*` characters by using `\*`
* `<marker>` can contain literal backslash `\` characters by using `\\`
