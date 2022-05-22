const { Parser } = require("acorn")

const MyParser = Parser.extend(
    require("./plugin.js")

)
// let code = MyParser.parse("let a=1n", { ecmaVersion: 2015 })
let program = `
    strk2(1)
    const a=1
`
let code = MyParser.parse(program, { ecmaVersion: 2015 })
console.log(code.body[1])