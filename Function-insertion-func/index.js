import babel from "@babel/core"
import fs from "fs"
import path from "path"
import esDirname from "es-dirname"
import Plugin from "./plugin.js"
const dirname = esDirname()
const source = fs.readFileSync(path.resolve(dirname, "./source.js"), {
    encoding: 'utf-8'
})

const { code } = babel.transformSync(source, {
    plugins: [
        [Plugin, {
            targetPath: "tracker"
        }]
    ]
})
console.log(code);

fs.writeFileSync(path.resolve(dirname, "./output.js"), code)
