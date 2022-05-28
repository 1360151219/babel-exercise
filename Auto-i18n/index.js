import babel from "@babel/core"
import parser from "@babel/parser"
import fs from "fs"
import path from "path"
import esDirname from "es-dirname"
import Plugin from "./plugin.js"
const dirname = esDirname()
const source = fs.readFileSync(path.resolve(dirname, "./source.jsx"), {
    encoding: 'utf-8'
})

const ast = parser.parse(source, {
    plugins: ["jsx"],
    sourceType: 'unambiguous'
})

const { code } = babel.transformFromAstSync(ast, source, {
    plugins: [
        [Plugin, {
            output: './dist'
        }],
    ]
})
console.log(code);

fs.writeFileSync(path.resolve(dirname, "./dist/output.js"), code)
