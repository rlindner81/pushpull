# PushPull
Convenience tool to make your files content flexible.

# Install
```
npm i pushpulljs --save-dev
```

# Example
Let's say we don't want the users of some repostiory to update `package-lock.json` with every `npm install`, but we _do_ want to give an easy option `npm run update-package-lock` for consciously updating it.

With PushPull this is easy. Just add appropriate comments to make your [.npmrc](./.npmrc) flexible.
```
.npmrc
package-lock=false # UPDATE_OFF
# UPDATE_ON package-lock=true

package.json/scripts
{
  "update-package-lock": "pushpull .npmrc --push '# UPDATE_ON' --pull '# UPDATE_OFF' && npm install && npm dedupe && pushpull .npmrc --push '# UPDATE_OFF' --pull '# UPDATE_ON'"
}
```

For this easy case, the `switch` directive would be even more appropriate. It does both `push` and `pull` of the same string in one pass.
```
package-lock=false # UPDATE
# UPDATE package-lock=true

package.json/scripts
{
  "update-package-lock": "pushpull .npmrc --switch '# UPDATE' && npm install && npm dedupe && pushpull .npmrc --switch '# UPDATE'"
}
```

<!--
pushpull *.js --pull // _OFF --push // HANA_ON
-->

# Syntax
```
pushpull <filter> [--push '<string>'] [--pull '<string>'] [--switch '<string>'] ...
```
The first argument `<filter>` is mandatory. It should filter those files you want to change, i.e., 
* `.eslintrc.yml` only the file `.eslintrc.yml` in the current directory,
* `*.yaml` all files with `.yaml` extension in the current directory,
* `**/*.yaml` all files with `.yaml` extension in the current directory and subdirectories,
* `config/**/*.js` all files with `.js` extension in all subdirectory of the `./config` directory.

All further arguments have to be directives `--push`, `--pull`, or `--switch` and a (quoted) string. As the name suggests, `push` means pushing the string to the end of the line, `pull` is the opposite and `switch` does both in one pass. The directives are executed in the order they are given.
