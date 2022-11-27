import { parse } from '@babel/parser';

function evall(code) {
    const ast = parse(code);

    evaluate(ast.program);
}

const scope = new Map();
const astInterpreters = {
    // 根节点 代码入口
    Program(node) {
        node.body.forEach(item => {
            evaluate(item);
        })
    },
    // 变量声明
    VariableDeclaration(node) {
        node.declarations.forEach((item) => {
            evaluate(item)
        })
    },
    VariableDeclarator(node) {
        const declareName = evaluate(node.id)
        if (scope.has(declareName)) throw Error("duplicate declare variable: " + declareName)
        else {
            const valueNode = node.init
            let value = ''
            if (valueNode.type == "Identifier") {
                value = evaluate(valueNode)
                if (scope.get(value)) value = scope.get(value)
            } else {
                // ObjectExpression
                value = evaluate(valueNode)
            }
            scope.set(declareName, value)

        }
    },
    ObjectExpression(node) {
        const obj = {}
        const properties = (node.properties)
        properties.forEach((item) => {
            const key = evaluate(item.key)
            const value = evaluate(item.value)
            obj[key] = value

        })
        return obj

    },
    Identifier(node) {
        // if (scope.get(node.name)) return scope.get(node.name)
        return node.name;
    },
    NumericLiteral(node) {
        return node.value;
    },
    ExpressionStatement(node) {
        return evaluate(node.expression)
    },
    AssignmentExpression(node) {
        const ans = [node.left]
        let curNode = node
        while (curNode.right.type === "AssignmentExpression") {
            curNode = curNode.right
            ans.push(curNode.left)
        }
        const key = evaluate(curNode.right)
        console.log(ans);

        ans.forEach((item) => {
            if (item.type === "Identifier") {
                const value = evaluate(item)
                scope.set(value, key)
            } else if (item.type === "MemberExpression") {
                const parent = evaluate(item.object)
                const paramName = evaluate(item.property)
                scope.get(parent)[paramName] = key
            }
        })
        return key

    }
}

function evaluate(node) {
    try {
        // console.log(node.type);
        return astInterpreters[node.type](node);
    } catch (e) {
        console.error('不支持的节点类型：', e);
    }
}

const code = `
let a = { n: 1};
let preA=a
a.x=a={n:2}

`
//a.x = a = { n: 2 }
// var a=b=1 相当于 var a=b ，b=1,b为全局变量了
//它外面怎么还包裹了个 ExpressionStatement 节点呢？
//因为表达式不能直接执行，语句才是执行的基本单位，那么表达式包裹一层表达式语句（ExpressionStatement）就可以了。
evall(code);
console.log(scope);
