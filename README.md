# PushPull
Convenience tool to make your files content flexible

# Example
Let's say we don't want the users of some repostiory to update `package-lock.json` with every `npm install`, but we _do_ want to give an easy option `npm run update-package-lock` for consciously updating it.

With PushPull this is easy -- just add appropriate comments to make your [.npmrc](./.npmrc) flexible.
```
.npmrc
package-lock=false # UPDATE_OFF
# UPDATE_ON package-lock=true

package.json/scripts
{
  "update-package-lock": "pushpull .npmrc --push '# UPDATE_ON' --pull '# UPDATE_OFF' && npm install && npm dedupe && pushpull .npmrc --push '# UPDATE_OFF' --pull '# UPDATE_ON'"
}
```

For this easy case, the `switch` command would be even more appropriate. It does both `push` and `pull` in one run.
```
package-lock=false # UPDATE
# UPDATE package-lock=true

package.json/scripts
{
  "update-package-lock": "pushpull .npmrc --switch '# UPDATE' && npm install && npm dedupe && pushpull .npmrc --switch '# UPDATE'"
}
```
