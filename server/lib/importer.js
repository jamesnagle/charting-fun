//const csv = require('fast-csv');
const glob = require('glob');
const BasicIterator = require('./iterator');

const { Logger, consoleLoggerInterface } = require('./logger');
const logger = new Logger(consoleLoggerInterface);

const { Persister, sqlitePersistanceInterface } = require('./persistance');
const db = new Persister(sqlitePersistanceInterface);

const { securitiesSchemaInterface } = require('./model');

const asyncPool = require('tiny-async-pool');


class Importer {
    constructor(importInterface) {
        this.importer = importInterface;
    }
    init(persistanceInstance, cacheInstance, dataSourceInstance) {
        this.importer.init(persistanceInstance, cacheInstance, dataSourceInstance)
    }
    sync() {
        this.importer.sync();
    }
}

const csvInterface = {
    init: function (persistanceInstance, cacheInstance, dataSourceInstance) {
        this.db = persistanceInstance;
        this.cache = cacheInstance;
        this.dataSource = dataSourceInstance;
    },
    sync: function() {
        this._getChanges((changesArray) => {
            if (changesArray.length > 0) {
                this._syncChanges(changesArray);
                return;
            }
            logger.log('No changes to CSV Data Sources detected.');
        });
    },
    _syncChanges: function (changesArray) {
        this._clearOldCacheRecords(changesArray);

        this._openEachDataSource(changesArray, (resp) => {
            if (resp.status === 'error') {
                return logger.log(resp.data);
            }
            this._clearOldPersistanceData(resp, (changeObj) => {
                this._createNewPersistance(changeObj, (obj) => {
                    this._importDataSource(obj);
                });
            });
        });
    },
    _importDataSource: function (importObj) {
        const table = this.dataSource.getSymbol(importObj.changeObj.path);

        db.setTable(table);

        return asyncPool(1, importObj.data.items, db.insertRow.bind(db)).then((res) => {
            logger.log('Import to SQLite finished. File: ' + importObj.changeObj.path);
        })
        .then(() => {
            this._cacheImport(importObj.changeObj);
        })
        .catch(this._handleCatch);
    },
    _cacheImport: function (changeObj) {
        this.cache.writeWithKey(changeObj.hashKey, {status: 'ok'}).then((cached) => {
            logger.log('Added to cache: ' + changeObj.hashKey);
        });
    },
    _clearOldPersistanceData: function (dataObj, callback) {
        const table = this.dataSource.getSymbol(dataObj.changeObj.path);
        db.drop(table).then((resp) => {
            callback(dataObj);
        })
        .catch(this._handleCatch);
    },
    _createNewPersistance: function (dataObj, callback) {
        const table = this.dataSource.getSymbol(dataObj.changeObj.path);

        db.createTable(table, securitiesSchemaInterface).then((resp) => {
            callback(dataObj);
        })
        .catch(this._handleCatch)
    },
    _clearOldCacheRecords: function (changesArray) {
        if (changesArray.length === 0) {
            return;
        }
        changesArray.forEach((changeObj) => {
            const symbol = this.dataSource.getSymbol(changeObj.path);

            // Find all files that begin with symbol i.e. (SPY)
            glob(__dirname + '/../cache/' + symbol + '*', {}, (err, filesToDeleteArray) => {
                if (err) {
                    logger.log(err);
                }
                this.cache.removeMany(filesToDeleteArray);
            });
        });
    },
    _openEachDataSource: function (changesArray, callback) {

        changesArray.forEach((changeObj) => {
            this.dataSource.dataSourceIterator(changeObj.path)
                .then(function(dataIterator) {
                    callback({
                        status: 'ok',
                        data: dataIterator,
                        changeObj: changeObj
                    });
                })
                .catch(function(err) {
                    callback({
                        status: 'error',
                        data: err
                    });
                }); 
        });
    },
    _getChanges: function (callback) {

        this.dataSource.availableSecurities((sourcesFilePathArray) => {
            let changesArray = [];
            /**
             * TODO: REMOVE .POP() CURRENTLY LIMITS IMPORT TO ONE .CSV
             */
            //const filePathIterator = new BasicIterator([sourcesFilePathArray.pop()]);
            const filePathIterator = new BasicIterator(sourcesFilePathArray);
            const fpCount = filePathIterator.count();
            let iteration = 0;
            
            filePathIterator.each((filePath, isLast) => {
                const symbol = this.dataSource.getSymbol(filePath);
                
                this.cache.hasher.hash(filePath).then((hash) => {
                    const hashKey = symbol + hash + '.json';
                    
                    this.cache.has(hashKey).then((resp) => {
                        if (!resp.isInCache) {
                            changesArray.push({path: filePath, hashKey: hashKey});
                        }

                        iteration++;
                        
                        // Last iteration
                        if (iteration === fpCount) {
                            callback(changesArray);
                        }
                    });
                }).catch(function(msg) {logger.log(msg)});
            });
        });
    },
    _handleCatch: function (err) {
        logger.log(err);
    }
}

module.exports = {
    Importer,
    csvInterface
}