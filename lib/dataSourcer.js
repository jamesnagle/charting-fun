const fs = require('fs');
const csv = require('fast-csv');
const find = require('find');
const path = require('path');

const { BasicIterator } = require('./iterator');
const { CSV, localFileInterface } = require('./File');

class DataSourcer {
    constructor(dataSourceInterface) {
        this.dataSource = dataSourceInterface;
    }
    dataSourceIterator(dataSource) {
        return this.dataSource.dataSourceIterator(dataSource);
    }
    availableSecurities(callback) {
        this.dataSource.availableSecurities(callback);
    }
    getSymbol(filePath) {
        return this.dataSource.getSymbol(filePath);
    }
}

const csvDataSource = {
    dataSourceIterator: async function (dataSource) {
        const csvFile = new CSV(localFileInterface);
        return await csvFile.read(dataSource);
    },
    availableSecurities: function (callback) {
        find.file(__dirname + '/../data', callback);
    },
    getSymbol: function (filePath) {
        return path.basename(filePath, path.extname(filePath));
    },
    _dataSourceIsAvailable: function (dataSource) {
        return new Promise((resolve, reject) => {
            this.availableSecurities(function(dataSourcesArray) {
                resolve(dataSourcesArray.includes(dataSource));
            });
        });
    }
};

module.exports = {
    DataSourcer,
    csvDataSource
}