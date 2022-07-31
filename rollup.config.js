import { babel } from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'

export default [
    {
        input: 'src/index.js',
        output: [
            {
                file: 'dist/aptos-indexer-api.js',
                format: 'esm',
            }
        ],
        plugins: [
            json(),
            nodeResolve(),
            commonjs(),
            babel({ babelHelpers: 'bundled' })
        ],
    }
]