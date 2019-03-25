// require(black-scholes)
// require(greeks)

//const find = require('find');
const { Importer, csvInterface } = require('./lib/importer');
const { Persister, sqlitePersistanceInterface } = require('./lib/persistance');
const { Hasher, objectHasherInterface, fileHasherInterface } = require('./lib/hasher');
const { Cacher , fileCacheInterface } = require('./lib/cacher');
const { DataSourcer, csvDataSource} = require('./lib/dataSourcer');

//const cache = new Cacher(fileCacheInterface);
//cache.init(objectHasherInterface);

function syncDataSourceWithPersistance() {
    const dataSource = new DataSourcer(csvDataSource);
    const db = new Persister(sqlitePersistanceInterface);
    const cache = new Cacher(fileCacheInterface);
    cache.init(fileHasherInterface);

    const importer = new Importer(csvInterface);
    importer.init(db, cache, dataSource);

    importer.sync();
}

syncDataSourceWithPersistance();
