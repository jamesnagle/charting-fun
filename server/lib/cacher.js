const fs = require('fs');
const find = require('find');
const { Hasher } = require('./hasher');

const { Transformer, stringifyDataStructureInterface } = require('./transformer');
const transform = new Transformer(stringifyDataStructureInterface);

const { Logger, consoleLoggerInterface } = require('./logger');
const logger = new Logger(consoleLoggerInterface);

class Cacher {
    constructor(cacheInterface) {
        this.cacher = cacheInterface;
    }
    init(hashInterface) {
        this.cacher.init(hashInterface);
        this.hasher = this.cacher.hasher;
    }
    has(hashKey) {
        return this.cacher.has(hashKey);
    }
    read(input) {
        return this.cacher.read(input);
    }
    write(data) {
        return this.cacher.write(data);
    }
    writeWithKey(hashKey, data) {
        return this.cacher.writeWithKey(hashKey, data);
    }
    remove(filePath) {
        this.cacher.removeFromCache(filePath);
    }
    removeMany(filePathArray) {
        this.cacher.removeMany(filePathArray);
    }
}

const fileCacheInterface = {
    init: function (hashInterface) {
        this.hasher = new Hasher(hashInterface);
    },
    has: function (hash) {
        return new Promise((resolve, reject) => {
            const hashKey = this._addExtension(hash);

            find.file(hashKey, __dirname +'/../cache', function (files) {
                if (files.length === 0) {
                    resolve({isInCache: false, hashKey: hashKey});
                }
                resolve({isInCache: true, hashKey: hashKey});
            }); 
        });       
    },
    read: function (pathOrHash) {
        return new Promise((resolve, reject) => {
            const filePath = this._buildFilePath(pathOrHash);

            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }
                const obj = transform.decode(data);
                resolve(obj);
            });
        });
    },
    write: function (data, prefix = '') {
        return new Promise((resolve, reject) => {
            const objHash = this.hasher.hash(data);
            const toSave = transform.encode(data);
            const buildPath = this._buildFilePath(objHash);

            this.has(prefix + objHash).then((resp) => {

                if (resp.isInCache === false) {
                    fs.writeFile(buildPath, toSave, 'utf8', (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(toSave);
                    });
                }
            });
        });        
    },
    writeWithKey: function (hashKey, data) {
        return new Promise((resolve, reject) => {
            const toSave = transform.encode(data);
            const buildPath = this._buildFilePath(hashKey);

            this.has(hashKey).then((resp) => {

                if (resp.isInCache === false) {
                    fs.writeFile(buildPath, toSave, 'utf8', (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(toSave);
                    });
                }
            });
        });        
    },    
    remove: function (hashOrPath) {
        const filePath = this._buildFilePath(hashOrPath);

        try {
            fs.unlinkSync(filePath);
            return true;
        } catch(err) {
            logger.log(err);
            return false;
        }
    },
    removeMany: function (pathOrHashArray) {
        //const _this = this;
        pathOrHashArray.forEach(pathOrHash => {
            const filePath = this._buildFilePath(pathOrHash);

            this.remove(filePath);
            logger.log('Removed ' + filePath + ' from cache.');
        });
    },
    _hasExtension: function (hash) {
        return (hash.substr(-5) === '.json') ? true : false;
    },
    _addExtension: function (hash) {
        if (!this._hasExtension(hash)) {
            hash = hash + '.json';
        }
        return hash;
    },
    _isFilePath: function (hashOrPath) {
        return (hashOrPath.substr(0, 1) === '/') ? true : false; 
    },
    _buildFilePath: function (pathOrHash) {
        if (!this._isFilePath(pathOrHash)) {
            const hashKey = this._addExtension(pathOrHash);
            return 'cache/' + hashKey;
        }
        return pathOrHash;
    }
}

module.exports = {
    Cacher,
    fileCacheInterface
};