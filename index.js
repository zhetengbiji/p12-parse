var child_process = require('child_process')
var path = require('path')
var del = require('del')
var textfile = require('textfile')

function exec(cmd, opt) {
    opt = Object.assign({
        cwd: __dirname
    }, opt)
    return new Promise((resolve, reject) => {
        child_process.exec(cmd, opt, (err, stdout, stderr) => {
            if(err) {
                reject(stderr)
            } else {
                resolve(stdout)
            }
        })
    })
}

function get(p12Path, password, cb) {
    var pemPath = path.join(__dirname, 'pem.pem')
    var cerPath = path.join(__dirname, 'cer.cer')
    var info = {}
    // 转换pem
    return exec(`openssl pkcs12 -in ${p12Path} -passin pass:${password} -out ${pemPath}  -nodes`)
        // 转换cer
        .then(() => {
            return exec(`openssl x509 -outform der -in ${pemPath} -out ${cerPath}`)
        })
        // 获取sha1
        .then(() => {
            return exec(`shasum ${cerPath}`)
        })
        .then(stdout => {
            info.sha1 = stdout.split(' ')[0].toUpperCase()
        })
        // 获取公钥信息
        .then(() => {
            return textfile.read(pemPath, 'string')
        })
        .then(str => {
            var publicKey = str.match(/-----BEGIN CERTIFICATE-----\n((?:\S+\n)+)-----END CERTIFICATE-----/)
            info.publicKey = publicKey[1].replace(/\n/g, '')
            var developer = str.match(/friendlyName\:\s([a-zA-Z\s]+)\:\s(.+)\s\(([A-Z0-9]+)/)
            if(!developer) {
                developer = str.match(/friendlyName\:\s([a-zA-Z\s]+)\:\s(.+)\n/)
            }
            info.type = developer[1]
            info.developer = {
                id: developer[3],
                name: developer[2],
            }
            var team = str.match(/OU\=([A-Z0-9]+)\/O\=(.+)\//)
            info.team = {
                id: team[1],
                name: team[2],
            }
        })
        // 清理
        .then(() => {
            return del(cerPath, {
                force: true
            })
        })
        .then(() => {
            return del(pemPath, {
                force: true
            })
        })
        .then(() => {
            if(typeof cb === 'function') {
                cb(info)
            }
            return Promise.resolve(info)
        })
}


module.exports = get