// require(black-scholes)
// require(greeks)
const Koa = require('koa');
const Router = require('koa-router');
const serve = require('koa-static');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyParser');

const app = new Koa();
const router = new Router();

const appPrefix = '/api/';
const appVersion = 'v1';

app.use(bodyParser());

//const syncDataSourceWithPersistance = require('./lib/syncDataSourceWithPersistance');
//syncDataSourceWithPersistance()


const { Persister, sqlitePersistanceInterface } = require('./lib/persistance');
const db = new Persister(sqlitePersistanceInterface);

const { Cacher, fileCacheInterface } = require('./lib/cacher');
const { objectHasherInterface } = require('./lib/hasher');
const cache = new Cacher(fileCacheInterface);
cache.init(objectHasherInterface)





router.post(`${appPrefix}${appVersion}/chart/`, async (ctx, next) => {

    const toChart = ctx.request.body.chart;

    const objHash = cache.hasher.hash(toChart);

    const cacheResponse = await cache.has(objHash);

    let data = [];
    if (cacheResponse.isInCache === true) {
        data = await cache.read(cacheResponse.hashKey)
        if (data) {
            console.log('Query data fetched from cache');
        }
    } else {
        data = await db.select().from(toChart.security).where('Date').between(toChart.range).get();
        const saved = await cache.write(data, cacheResponse.hashKey);
        if (saved) {
            console.log('Query added to cache');
        }
    }

    console.log(toChart);

    ctx.body = {
        chart: data,
        status: 'ok'
    };
    await next();
});

app.use(serve(__dirname + '/../client/public'));
app.use(logger());
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(3000);