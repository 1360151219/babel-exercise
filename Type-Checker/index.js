import fse from "fs-extra"
import esDirname from "es-dirname"
import path from "path"
import parser from "@babel/parser"
import babel from "@babel/core"
import AssignmentCheckerPlugin from "./plugins/plugin-assignment-checker.js"
const dirname = esDirname()
const source = fse.readFileSync(path.resolve(dirname, './source.ts'), {
    encoding: 'utf-8'
})
// console.log(source)
const ast = parser.parse(source, {
    sourceType: "unambiguous",
    plugins: ["typescript"]
})
const { code } = babel.transformFromAstSync(ast, source, {
    plugins: [
        [AssignmentCheckerPlugin]

    ]
})
// console.log(code);
