# p12-parse

Uses javascript to parse the contents of the p12 formatted certificate file.

## install

```
npm i p12-parse --save
```

## use

```js
var p12 = require('p12-parse')

p12('xxx.p12', 'password')
    .then(info => {
        console.log(info)
    })
```