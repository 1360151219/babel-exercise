/*
 * @Author: 盐焗乳鸽还要砂锅
 * @Date: 2022-05-21 21:50:32
 * @Description: 插件形式
 */

const target = ['log', 'info', 'error', 'debug'].map(item => `console.${item}`);




module.exports = function ({ types, template }, options) {
    return {
        visitor: {
            //state 中可以拿到用户配置信息 options 和 file 信息
            CallExpression(path, state) {
                const node = path.node
                if (node.isNew) return
                const calleeCode = path.get("callee").toString()
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
        }
    }
}



