var p12 = require('../index')
p12('/Users/guoshengqiang/Documents/项目资源/uileader/iOS/ios_development.p12', 'uileader666')
    .then(info => {
        console.log('p12 info: ', info)
    })