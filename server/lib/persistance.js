const Promise = require('bluebird');
const sqlite = require('sqlite');

const { securitiesSchemaInterface } = require('./model');
const DateRange = require('./DateRange');

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
    select(colsObj) {
        this.persist.select(colsObj);
        return this;
    }
    from(table) {
        this.persist.from(table);
        return this;
    }
    where(col, cond = null) {
        this.persist.where(col, cond);
        return this;
    }
    between(fromOrRange, to = null) {
        this.persist.between(fromOrRange, to);
        return this;
    }
    async get() {
        return await this.persist.get()
    }
}

const sqlitePersistanceInterface = {
    _query: '',
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
        vals[0] = "'"+vals[0]+"'";
        const colStr = cols.join(', ');
        const valueStr = vals.join(', ');
        const sql = 'INSERT INTO ' + table + ' (' + colStr + ') VALUES (' + valueStr + ')';
        console.log(sql);
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
    select: function (colsObj = null) {
        this._resetQuery();
        let cols = '';

        if (!colsObj) {
            cols = '*';
        } else {
            const colsArray = Object.keys(securitiesSchemaInterface);
            cols = colsArray.join(', ').trim();
        }

        this._query += `SELECT ${cols} `;

        return this;
    },
    from: function (table) {
        this._query += `FROM ${table} `;
        return this;
    },
    where: function (col, cond = null) {
        /**
         * TODO: add cond (condition support)
         * Shipping for BETWEEN only at the moment.
         */
        this._query += `WHERE ${col} `;
        return this;
    },
    between: function (fromOrRange, to = null) {
        let range = new DateRange();

        if (!range.isPredefined(fromOrRange)) {
            throw "Persistance.between() only supports predefinded ranges at the moment."
        }
        const btw = range.predefined(fromOrRange).get();
        this._query += `BETWEEN '${btw.from}' AND '${btw.to}'`;
        return this;
    },
    get: async function () {
        const db = await this._dbPromise();
        return await db.all(this._query);
    },
    _resetQuery: function () {
        this._query = '';
    },
    _buildCreateQueryFromSchema: function (table, schema) {
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