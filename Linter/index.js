import fse from "fs-extra"
import esDirname from "es-dirname"
import path from "path"
import parser from "@babel/parser"
import babel from "@babel/core"
import forLinterPlugin from "./plugins/plugin-for-linter.js"
import funcReassignPlugin from "./plugins/plugin-function-reassign.js"
import eqPlugin from "./plugins/plugin-eq.js"
const dirname = esDirname()
const source = fse.readFileSync(path.resolve(dirname, './source.js'), {
    encoding: 'utf-8'
})

const ast = parser.parse(source, {
    sourceType: "unambiguous",
    // plugins: ["typescript"]
})
const { code } = babel.transformFromAstSync(ast, source, {
    plugins: [
        // [forLinterPlugin]
        // [funcReassignPlugin]
        [eqPlugin, {
            autoFix: true
        }]
    ]
})
// console.log(code);
