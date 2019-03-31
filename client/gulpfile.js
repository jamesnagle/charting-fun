const { watch, src, dest, parallel } = require('gulp');
const gulpSass = require('gulp-sass');
const uglify = require('gulp-uglify-es').default;
const sourcemaps = require('gulp-sourcemaps');
const rollup = require('gulp-better-rollup');

const gulpConfig = require('./gulp-config');

function sass() {
    return src(['node_modules/bootstrap/scss/bootstrap-grid.scss', 'src/sass/**/*.scss'])
        .pipe(gulpSass())
        .pipe(dest('public/css/'))
}

function js() {
    return src('src/js/app.js')
        .pipe(sourcemaps.init())
        .pipe(rollup(gulpConfig.rollupInput, gulpConfig.rollupOutput))
        //.pipe(uglify())
        .pipe(sourcemaps.write(''))
        .pipe(dest('public/js'))
}

async function watchSass() {
    return await watch(['src/sass/**/*.scss'], sass);
}
async function watchJS() {
    return await watch(['src/js/**/*.js'], js);
}

exports.js = js;
exports.sass = sass;
exports.watch = parallel(watchSass, watchJS);
exports.build = parallel(sass, js);
exports.default = parallel(sass, js, watchSass, watchJS);
