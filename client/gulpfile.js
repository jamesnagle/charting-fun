const { watch, src, dest, parallel } = require('gulp');
const gulpSass = require('gulp-sass');
const uglify = require('gulp-uglify-es').default;
const sourcemaps = require('gulp-sourcemaps');
const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const replace = require('rollup-plugin-replace');

function sass() {
    return src(['node_modules/bootstrap/scss/bootstrap-grid.scss', 'src/sass/**/*.scss'])
        .pipe(gulpSass())
        .pipe(dest('public/css/'))
}

function js() {
    return src('src/js/app.js')
        .pipe(sourcemaps.init())
        .pipe(rollup({
            plugins: [
                resolve(),
                babel({
                    "exclude": "node_modules/**/",
                    "presets": [
                        "@babel/preset-env", 
                        "@babel/preset-react"
                    ],
                    "plugins": [
                        "styled-jsx/babel"
                    ]
                }),
                commonjs(),
                replace({
                    'process.env.NODE_ENV': JSON.stringify( 'production' )
                })
            ]
        }, 'iife'))
        .pipe(sourcemaps.write(''))
        .pipe(dest('public/js'))
}

function buildjs() {
    return src('src/js/app.js')
        .pipe(sourcemaps.init())
        .pipe(rollup({
            plugins: [
                resolve(),
                babel({
                    "exclude": "node_modules/**/",
                    "presets": [
                        "@babel/preset-env", 
                        "@babel/preset-react"
                    ],
                    "plugins": [
                        "styled-jsx/babel"
                    ]
                }),
                commonjs()
            ]
        }, 'iife'))
        .pipe(uglify())
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
exports.buildjs = buildjs;
exports.sass = sass;
exports.watch = parallel(watchSass, watchJS);
exports.build = parallel(sass, buildjs);
exports.default = parallel(sass, js, watchSass, watchJS);
