const hash = require('object-hash');
const md5File = require('md5-file');


class Hasher {
    constructor(hashInterface) {
        this.hasher = hashInterface;
    }
    hash(input) {
        return this.hasher.hash(input);
    }
}

const objectHasherInterface = {
    hash: function (obj) {
        return hash(obj);
    }
}

const fileHasherInterface = {
    hash: function(filePath) {
        return new Promise(function(resolve, reject) {
            md5File(filePath, function (err, hash) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(hash);
            });
        });
    }
}

module.exports = {
    Hasher,
    objectHasherInterface,
    fileHasherInterface
}