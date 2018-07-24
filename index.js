var child_process = require('child_process')
var path = require('path')
var del = require('del')
var textfile = require('textfile')
var escape = require('shell-argument-escape').escape

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
    // to pem
    return exec(`openssl pkcs12 -in ${escape(p12Path)} -passin pass:${escape(password)} -out ${escape(pemPath)}  -nodes`)
        // to cer
        .then(() => {
            return exec(`openssl x509 -outform der -in ${escape(pemPath)} -out ${escape(cerPath)}`)
        })
        // get sha1
        .then(() => {
            return exec(`shasum ${escape(cerPath)}`)
        })
        .then(stdout => {
            info.sha1 = stdout.split(' ')[0].toUpperCase()
        })
        // get public key info
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
        // clear
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