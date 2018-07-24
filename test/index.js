var p12 = require('../index')
p12('/Users/guoshengqiang/Documents/ios_development.p12', 'myPassword')
    .then(info => {
        console.log('p12 info: ', info)
    })