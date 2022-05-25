/*
 * @Author: 盐焗乳鸽还要砂锅
 * @Date: 2022-05-21 20:57:15
 * @Description: 给console.log添加代码信息
 * 
 */

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const types = require('@babel/types');

const sourceCode = `
    function foo(){
        let a=1
        a=2
    }
`;
// const target = ["log", "warn", "error", "debug", "info"]
const target = ['log', 'info', 'error', 'debug'].map(item => `console.${item}`);
const ast = parser.parse(sourceCode, {
    //parser 需要指定代码是不是包含 import、export 等，需要设置 moduleType 为 module
    //或者 script，我们干脆设置为 unambiguous，让它根据内容是否包含 import、export 来自动设置 moduleType。
    sourceType: "unambiguous",
    plugins: ["jsx"]
})

traverse(ast, {
    CallExpression(path, state) {
        const node = path.node


        // 太繁琐了
        // if (types.isMemberExpression(node.callee)
        //     && node.callee.object.name === "console"
        //     && target.includes(node.callee.property.name))

        // 一样的效果
        // console.log(path.get("callee").toString());
        const calleeCode = generate(path.node.callee).code
        if (target.includes(calleeCode)) {
            const { line, column } = node.callee.loc.start
            node.arguments.push(types.stringLiteral(`filename:(line:${line},column:${column})`))
        }

    },
    FunctionDeclaration(path, state) {
        console.log(path.scope.bindings);
    }
})

const { code, map } = generate(ast)
console.log(code);

// eval(code)