var child_process = require('child_process')
var path = require('path')
var del = require('del')
var textfile = require('textfile')
var exec = child_process.exec
function get(p12Path, password, cb) {
    var pemPath = path.join(__dirname, 'pem.pem')
    var cerPath = path.join(__dirname, 'cer.cer')
    var info = {}
    // 转换pem
    var cmd = `openssl pkcs12 -in ${p12Path} -passin pass:${password} -out ${pemPath}  -nodes`
    exec(cmd, {
        cwd: __dirname
    }, (err, stdout, stderr) => {
        if(!err) {
            // 转换cer
            var cmd = `openssl x509 -outform der -in ${pemPath} -out ${cerPath}`
            exec(cmd, {
                cwd: __dirname
            }, (err, stdout, stderr) => {
                if(!err) {
                    // 获取sha1
                    var cmd = `shasum ${cerPath}`
                    exec(cmd, {
                        cwd: __dirname
                    }, (err, stdout, stderr) => {
                        if(!err) {
                            var sha1 = stdout.split(' ')[0].toUpperCase()
                            info.sha1 = sha1
                            // 获取公钥
                            textfile.read(pemPath, 'string', (str) => {
                                var publicKey = str.match(/-----BEGIN CERTIFICATE-----\n((?:.+\n)+.+==)/)
                                info.publicKey = publicKey[1].replace(/\n/g, '')
                                var eveloper = str.match(/friendlyName\:\s([a-zA-Z\s]+)\:\s(.+)\s\(([A-Z0-9]+)/)
                                info.type = eveloper[1]
                                info.eveloper = {
                                    id: eveloper[3],
                                    name: eveloper[2],
                                }
                                var team = str.match(/OU\=([A-Z0-9]+)\/O\=(.+)\//)
                                info.team = {
                                    id: team[1],
                                    name: team[2],
                                }
                                del(cerPath, {
                                    force: true
                                }).then(() => {
                                    del(pemPath, {
                                        force: true
                                    }).then(() => {
                                        if(typeof cb === 'function') {
                                            cb(info)
                                        }
                                    })
                                })
                            })
                            // del(cerPath)
                        } else {
                            throw new Error(stderr)
                        }
                    })
                } else {
                    throw new Error(stderr)
                }
            })
        } else {
            throw new Error(stderr)
        }
    })
}


module.exports = get