import fse from "fs-extra"
import esDirname from "es-dirname"
import path from "path"
import parser from "@babel/parser"
import babel from "@babel/core"
import ConfusePlugin from "./plugins/plugin-confuse.js"
import CompressionPlugin from "./plugins/plugin-conpression.js"
const dirname = esDirname()
const source = fse.readFileSync(path.resolve(dirname, './source.js'), {
    encoding: 'utf-8'
})
// console.log(source)
const ast = parser.parse(source, {
    sourceType: "unambiguous",
})

const { code } = babel.transformFromAstSync(ast, source, {
    plugins: [
        [CompressionPlugin]
        // [ConfusePlugin]

    ]
})
console.log(code);
