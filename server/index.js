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

const getDataFromCacheOrPersistance = require('./lib/getDataFromCacheOrPersistance');
//const syncDataSourceWithPersistance = require('./lib/syncDataSourceWithPersistance');
//syncDataSourceWithPersistance()


router.post(`${appPrefix}${appVersion}/chart/`, async (ctx, next) => {

    const toChart = ctx.request.body.chart;

    const data = await getDataFromCacheOrPersistance(toChart);

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