const { Persister, sqlitePersistanceInterface } = require('./persistance');
const db = new Persister(sqlitePersistanceInterface);

const { Cacher, fileCacheInterface } = require('./cacher');
const { objectHasherInterface } = require('./hasher');

const cache = new Cacher(fileCacheInterface);
cache.init(objectHasherInterface)

async function getDataFromCacheOrPersistance(chartRequestObj) {
    
    const objHash = cache.hasher.hash(chartRequestObj);

    const cacheResponse = await cache.has(objHash);

    let data = [];
    if (cacheResponse.isInCache === true) {
        data = await cache.read(cacheResponse.hashKey)
    } else {
        data = await db.select().from(chartRequestObj.security).where('Date').between(chartRequestObj.range).get();
        await cache.write(data, cacheResponse.hashKey);
    }
    return data;
}

module.exports = getDataFromCacheOrPersistance;