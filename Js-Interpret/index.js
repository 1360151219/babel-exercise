import parser from "@babel/parser"
import { codeFrameColumns } from "@babel/code-frame"

const code = `const a=1+2`
const ast = parser.parse(code, {
    sourceType: "unambiguous"
})

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
    Identifier: (node, scope) => {
        return node.name
    },
    BinaryExpression: (node, scope) => {
        let left = evaluate(node.left, scope)
        let right = evaluate(node.right, scope)
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
const globalScope = new Map()
evaluate(ast.program, globalScope)
console.log(globalScope);
