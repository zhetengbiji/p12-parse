# p12-parse
## install
```
npm i p12-parse --save
```
## use
```js
var p12=require('p12-parse')

p12('xxx.p12', 'password', info => {
    console.log(info)
})
```