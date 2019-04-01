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

const BasicSimulation = require('./lib/BasicSimulation');
const getDataFromCacheOrPersistance = require('./lib/getDataFromCacheOrPersistance');
const syncDataSourceWithPersistance = require('./lib/syncDataSourceWithPersistance');
syncDataSourceWithPersistance()


router.post(`${appPrefix}${appVersion}/chart/`, async (ctx, next) => {

    const toChart = ctx.request.body.chart;

    let data = [];

    if (toChart.type === 'basicSimulation') {
        const bSim = new BasicSimulation(toChart);
        data = await bSim.run();
    } else {
        data = await getDataFromCacheOrPersistance(toChart);
    }

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