const moment = require('moment');

const { Persister, sqlitePersistanceInterface } = require('./persistance');
const db = new Persister(sqlitePersistanceInterface);

const { Cacher, fileCacheInterface } = require('./cacher');
const { objectHasherInterface } = require('./hasher');

const cache = new Cacher(fileCacheInterface);
cache.init(objectHasherInterface);

const BasicIterator = require('./iterator');


class BasicSimulation {
    /*
    {
        type: 'basicSimulation',
        strategy: 'PUT',
        security: 'TLT',
        dateRange: 'LAST_2_YEARS',
        amountAbove: null,
        amountBelow: 1.00,
        strikeDistance: 0.50,
        purchaseInterval: 'weekly',   // daily, weekly, monthly,
        avgDaysOut: 7
    }
    */
    constructor(chartRequestObj) {
        this.dbPartial = {
            security: chartRequestObj.security,
            dateRange: chartRequestObj.dateRange,
            type: chartRequestObj.type
        }
        this.dbHash = cache.hasher.hash(this.dbPartial);
        this.progPartial = {
            dbHash: this.dbHash,
            strategy: chartRequestObj.strategy,
            amountAbove: chartRequestObj.amountAbove,
            amountBelow: chartRequestObj.amountBelow,
            strikeDistance: chartRequestObj.strikeDistance,
            purchaseInterval: chartRequestObj.purchaseInterval,
            avgDaysOut: chartRequestObj.avgDaysOut
        }
        this.progHash = cache.hasher.hash(this.progPartial);
    }
    async run() {
        //let data = [];
        const progCacheResp = await cache.has(this.progHash);

        if (progCacheResp.isInCache === true) {
            console.log('from first cache');
            return await cache.read(progCacheResp.hashKey);
        }
        
        const dbData = await this.getFromCacheOrDB();

        return await this.doSimulation(dbData, this.progPartial)
    }
    async getFromCacheOrDB() {
        const dbCacheResp = await cache.has(this.dbHash);

        if (dbCacheResp.isInCache === true) {
            console.log('from db partial cache');
            return await cache.read(dbCacheResp.hashKey);
        }
        const dbData = await db.select({Date: '', Open: '', Close: ''})
                                .from(this.dbPartial.security)
                                .where('Date')
                                .between(this.dbPartial.dateRange)
                                .get();
        await cache.write(dbData, dbCacheResp.hashKey);
        return dbData;
    }
    async doSimulation(dbData, progObj) {
        const dataIterator = new BasicIterator(dbData);
        const simResult = this.purchaseContracts(dataIterator, progObj.strategy, progObj.amountBelow);

        await cache.write(simResult, this.progHash);
        return simResult;
    }
    purchaseContracts(dataIterator, strategy, amountBelow) {
        let contractsArray = [];

        const fridaysMap = this.allFridaysMap(dataIterator);
        const mondaysArray = new BasicIterator(this.allMondays(dataIterator));

        mondaysArray.each((row) => {
            const thisFriday = moment(row.Date).add(4, 'days').format('YYYY-MM-DD');
            const isInFridayMap = fridaysMap.has(thisFriday);
            if (isInFridayMap) {
                const midPoint = (row.Open + row.Close) / 2;
                const medianPrice = midPoint.toFixed(2);
                const strikePrice = this.strikePrice(strategy, medianPrice, amountBelow);
                const fridayClose = fridaysMap.get(thisFriday).toFixed(2);

                const isWinner = this.strategyIsWinner(strategy, strikePrice, fridayClose);
                contractsArray.push({
                    isWinner,
                    strikePrice: medianPrice,
                    priceAtExpiration: fridayClose,
                    datePurchased: row.Date,
                    expirationDate: thisFriday
                });
            }
        });

        return contractsArray
    }
    allFridaysMap(dataIterator) {
        const weekDayToFind = moment().day('Friday').weekday(); 
        let fridayMap = new Map();

        dataIterator.each((row) => {
            const thisDay = moment(row.Date).day();
            if (thisDay === weekDayToFind) {
                fridayMap.set(row.Date, row.Close);
            }
        });
        
        return fridayMap;
    }
    allMondays(dataIterator) {
        const weekDayToFind = moment().day('Monday').weekday(); 
        let mondayArray = [];

        dataIterator.each((row) => {
            const thisDay = moment(row.Date).day();
            if (thisDay === weekDayToFind) {
                mondayArray.push(row);
            }
        });
        
        return mondayArray;
    }
    strategyIsWinner(strategy, strike, close) {
        if (strategy === 'PUT') {
            return (strike < close) ? true : false;
        } else if (strategy === 'CALL') {
            return (strike > close) ? true : false;
        }
    }
    strikePrice(strategy, currentPrice, offset) {
        if (strategy === 'PUT') {
            return (currentPrice - offset);
        } else if (strategy === 'CALL') {
            return (currentPrice + offset);
        }
    }
}

module.exports = BasicSimulation;