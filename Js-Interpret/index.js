import parser from "@babel/parser"
import { codeFrameColumns } from "@babel/code-frame"
import chalk from "chalk"
const code = `
const a=1+2
console.log(a)
console.error(a)
function add(a,b){return a+b}
console.warn(add(1,2))
`
const ast = parser.parse(code, {
    sourceType: "unambiguous"
})
class Scope {
    constructor(parentScope) {
        this.parent = parentScope
        this.declarations = []
    }
    set(name, val) {
        this.declarations[name] = val
    }
    getLocal(name) {
        return this.declarations[name]
    }
    get(name) {

        let res = this.getLocal(name)
        if (!res && this.parent) {
            // 递归向上搜索

            res = this.parent.get(name)
        }
        return res
    }
    has(name) {
        return !!this.getLocal(name)
    }
}
const astInterpreters = {
    Program: (node, scope) => {
        node.body.forEach((child) => {
            evaluate(child, scope)
        })
    },
    VariableDeclaration: (node, scope) => {
        // kind
        node.declarations.forEach((declaration) => {
            evaluate(declaration, scope)
        })
    },
    VariableDeclarator: (node, scope) => {
        let id = evaluate(node.id)
        if (scope.has(id)) {
            throw Error('duplicate declare variable：' + declareName);
        } else {
            let init = evaluate(node.init)
            scope.set(id, init)
        }
    },
    ExpressionStatement: (node, scope) => {
        evaluate(node.expression, scope)
    },
    FunctionDeclaration: (node, scope) => {
        // 自定义函数：函数内块作用域
        let id = evaluate(node.id)
        if (scope.has(id)) {
            throw Error('duplicate declare variable：' + declareName);
        } else {
            scope.set(id, function (...args) {
                const funcScope = new Scope(scope)
                node.params.forEach((item, index) => {
                    funcScope.set(evaluate(item), args[index])
                })
                funcScope.set('this', this)
                return evaluate(node.body, funcScope)
            })
        }
    },
    // 函数调用
    CallExpression: (node, scope) => {
        let fn = evaluate(node.callee, scope)
        if (typeof fn === 'string') fn = scope.get(fn)
        let args = node.arguments.map((item) => {
            if (item.type === 'Identifier') return scope.get(item.name)
            return evaluate(item, scope)
        })
        // 返回值
        if (node.callee.type === 'MemberExpression') {
            const obj = evaluate(node.callee.object)
            return fn.apply(obj, args)
        } else {
            return fn.apply(null, args)
        }

    },
    BlockStatement: (node, scope) => {
        for (let i of node.body) {
            if (i.type === 'ReturnStatement') {
                return evaluate(i, scope)
            }
            evaluate(i, scope)
        }
    },
    ReturnStatement: (node, scope) => {
        return evaluate(node.argument, scope)
    },
    MemberExpression: (node, scope) => {

        const obj = scope.get(evaluate(node.object))

        return obj[evaluate(node.property)]
    },
    Identifier: (node, scope) => {
        return node.name
    },
    BinaryExpression: (node, scope) => {
        let left = evaluate(node.left, scope)
        if (node.left.type === 'Identifier') {
            left = scope.get(left)
        }
        let right = evaluate(node.right, scope)
        if (node.right.type === 'Identifier') {
            right = scope.get(right)
        }
        switch (node.operator) {
            case '+':
                return left + right
            case '-':
                return leftValue - rightValue;
            case '*':
                return leftValue * rightValue;
            case '/':
                return leftValue / rightValue;
            default:
                throw Error('upsupported operator：' + node.operator);
        }

    },
    NumericLiteral: (node, scope) => {
        return node.value;
    }
}
function evaluate(node, scope) {
    try {
        // console.log(node);
        return astInterpreters[node.type](node, scope)
    } catch (e) {
        if (e && e.message && e.message.indexOf('astInterpreters[node.type] is not a function') > -1) {
            console.error(`unsupport type for ${node.type}`);
            console.error(codeFrameColumns(code, node.loc, {
                highlightCode: true
            }))
            // console.log(node.loc);
        }


    }
}
const globalScope = new Scope()
// 全局对象
globalScope.set('console', {
    log: function (...args) {
        console.log(chalk.green(...args));
    },
    error: function (...args) {
        console.error(chalk.red(...args));
    },
    warn: function (...args) {
        console.warn(chalk.yellow(...args));
    }
})
evaluate(ast.program, globalScope)
// console.log(globalScope);
