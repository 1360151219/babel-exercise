const { transformFileSync } = require("@babel/core")

const plugin = require("./index3.js")
const fs = require("fs")

// require 引入，该文件会被全部执行
// const { sourceCode } = require("./index2.js") 
const path = require("path")
const { code } = transformFileSync(path.resolve(__dirname, "sourceCode.js"), {
    plugins: [plugin],
    parserOpts: {
        sourceType: 'unambiguous',
        plugins: ['jsx']
    }
});

fs.writeFileSync("./bundle.jsx", code)