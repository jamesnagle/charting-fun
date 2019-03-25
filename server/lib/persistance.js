const Promise = require('bluebird');
const sqlite = require('sqlite');

const { Logger, consoleLoggerInterface } = require('./logger');
const logger = new Logger(consoleLoggerInterface);

class Persister {
    constructor(persistanceInterface) {
        this.persist = persistanceInterface;
    }
    insert(table, dataObj) {
        return this.persist.insert(table, dataObj);
    }
    insertRow(dataObj) {
        return this.persist.insertRow(dataObj);
    }
    truncate(table) {
        return this.persist.truncate(table);
    }
    drop(table) {
        return this.persist.drop(table);
    }
    createTable(table, customSchema = null) {
        return this.persist.createTable(table, customSchema);
    }
    hasTable(table) {
        return this.persist.hasTable(table);
    }
    setTable(table) {
        this.persist.setTable(table);
    }
    setSchema(schemaInterface) {
        this.persist.setSchema(schemaInterface);
    }
    getSchema() {
        this.persist.getSchema();
    }
    transformResponse(resp) {
        return this.persist.transformResponse(resp);
    }
}

const sqlitePersistanceInterface = {
    table: null,
    insert: async function (table, dataObj) {
        const db = await this._dbPromise();
        const normalizedData = {
            Date: dataObj.Date,
            Open: Number(dataObj.Open),
            High: Number(dataObj.High),
            Low: Number(dataObj.Low),
            Close: Number(dataObj.Close),
            AdjClose: Number(dataObj['Adj Close']),
            Volume: Number(dataObj.Volume)
    
        };
        const cols = Object.keys(normalizedData);
        const vals = Object.values(normalizedData);
        const colStr = cols.join(', ');
        const valueStr = vals.join(', ');
        const sql = 'INSERT INTO ' + table + ' (' + colStr + ') VALUES (' + valueStr + ')';
        return await db.run(sql);
        
    },
    insertRow: async function (dataObj) {
        if (!this.table) {
            throw "Call .setTable() before .insertRow(). Table property not initialized."
        }
        return await this.insert(this.table, dataObj);
    },
    setTable: function (table) {
        this.table = table;
    },
    drop: async function (table) {
        const db = await this._dbPromise();
        return await db.run('DROP TABLE IF EXISTS ' + table);
    },
    createTable: async function (table, customSchema = null) {
        const schema = this._ensureSchema(customSchema);

        const db = await this._dbPromise();
        return await db.run(this._buildCreateQueryFromSchema(table, schema))
    },
    hasTable: async function (table) {
        const db = await this._dbPromise();
        return await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='" + table + "'");
    },
    setSchema: function (schemaInterface) {
        this.schema = schemaInterface;
    },
    getSchema: function () {
        return this.schema;
    },
    transformResponse: function (resp) {
        return {
            sql: resp.sql,
            lastID: resp.lastID,
            changes: resp.changes
        };
    },    
    _buildCreateQueryFromSchema: function(table, schema) {
        const colNameArray = Object.keys(schema);

        let subString = '(';
        colNameArray.forEach((colName) => {
            subString = subString + ' ' + colName + ' ' + schema[colName] + ','
        });
        subString = subString.slice(0, -1) + ')';

        return 'CREATE TABLE IF NOT EXISTS ' + table + subString;
    },
    _ensureSchema: function (schema) {
        if (!schema) {
            return this.getSchema();
        }
        return schema;
    },
    _dbPromise: function () {
        return sqlite.open('./securities.sqlite', { Promise });
    }
};

module.exports = {
    Persister,
    sqlitePersistanceInterface
}