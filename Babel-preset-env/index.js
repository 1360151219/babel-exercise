import { transformSync } from "@babel/core"


import fs from "fs"

// @babel/plugin-transform-runtime  解决全局环境污染问题
// 将注入的代码和corejs引入的全局变量都转换成了@babel/runtime-corejs3的形式
let source = `
async function foo(){}
`
const { code } = transformSync(source, {
    presets: [
        ['@babel/preset-env', {
            targets: 'chrome 30',
            debug: true,
            useBuiltIns: 'usage',// "usage", or "entry" or "false"
            corejs: 3 // babel7 所用的polyfill 3支持示例方法
        }]
    ],
    plugins: [
        ['@babel/transform-runtime', {
            corejs: 3
        }]
    ]
})
fs.writeFileSync("./output.js", code)

// babel runtime 包含的代码：helper、core-js、regenerator
