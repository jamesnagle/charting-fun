const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const replace = require('rollup-plugin-replace');

const commonJS = {
    include: 'node_modules/**',
    namedExports: {
        'node_modules/react/index.js': [
            'Component',
            'PureComponent',
            'Fragment',
            'Children',
            'createElement'
        ]
    }
}

module.exports = {
    rollupInput: {
        plugins: [
            resolve(),
            babel(),
            commonjs(commonJS),
            replace({
                'process.env.NODE_ENV': JSON.stringify( 'production' )
            })
        ],
        external: [
            'axios',
            'react',
            'react-dom'
        ]    
    },
    rollupOutput: {
        output: {
            'globals': {
                'axios': 'axios',
                'react': 'React',
                'react-dom': 'ReactDOM'
            }
        },
        format: 'iife'
    }
}

