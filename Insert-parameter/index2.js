/*
 * @Author: 盐焗乳鸽还要砂锅
 * @Date: 2022-05-21 20:57:15
 * @Description: 给console.log添加代码信息（节点外）
 * 
 */

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const types = require('@babel/types');
const template = require("@babel/template")

const sourceCode = `
    console.log(1);

    function func() {
        console.info(2);
    }

    export default class Clazz {
        say() {
            console.debug(3);
        }
        render() {
            return <div>{console.error(4)}</div>
        }
    }
`;
const target = ['log', 'info', 'error', 'debug'].map(item => `console.${item}`);
const ast = parser.parse(sourceCode, {
    sourceType: "unambiguous",
    plugins: ["jsx"]
})

// 插入ast： path.insertBefore()
// 替换整体节点：path.replaceWith()
// 跳过子节点遍历：path.skip()
// path.findParent()
traverse(ast, {
    CallExpression(path, state) {
        const node = path.node
        if (node.isNew) return
        const calleeCode = generate(path.node.callee).code
        if (target.includes(calleeCode)) {

            const { line, column } = node.callee.loc.start
            const newNode = template.expression(`console.log("filename:line:${line},column:${column}")`)()
            newNode.isNew = true // 新节点插入后不用遍历
            if (path.findParent(path => path.isJSXElement())) {
                // JSX中只支持单个表达式，因此要替换成一个数组表达式
                path.replaceWith(types.arrayExpression([newNode, path.node]))
                path.skip()
            } else {
                path.insertBefore(newNode)
            }
        }

    }
})

const { code, map } = generate(ast)
console.log(code);


// eval(code)

module.exports = {
    sourceCode
}