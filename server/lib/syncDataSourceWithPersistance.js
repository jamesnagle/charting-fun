const { Importer, csvInterface } = require('./importer');
const { Persister, sqlitePersistanceInterface } = require('./persistance');
const { Hasher, objectHasherInterface, fileHasherInterface } = require('./hasher');
const { Cacher , fileCacheInterface } = require('./cacher');
const { DataSourcer, csvDataSource} = require('./dataSourcer');

async function syncDataSourceWithPersistance() {
    const dataSource = new DataSourcer(csvDataSource);
    const db = new Persister(sqlitePersistanceInterface);
    const cache = new Cacher(fileCacheInterface);
    cache.init(fileHasherInterface);

    const importer = new Importer(csvInterface);
    importer.init(db, cache, dataSource);

    await importer.sync();
}