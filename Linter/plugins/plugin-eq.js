import { declare } from "@babel/helper-plugin-utils";
const target = ["==", "!="]
export default declare((api, options, dirname) => {
    api.assertVersion(7)
    return {
        pre: (file) => {
            file.set('errs', [])
        },
        post: (file) => {
            console.log(file.get('errs'));
            if (options.autoFix) {
                console.log("auto fixed !");

            }
        },
        visitor: {
            BinaryExpression: (path, state) => {
                const errs = state.file.get('errs')
                let left = path.get("left")
                let right = path.get("right")
                const operator = path.get("operator").node
                if (target.includes(operator)) {
                    // 对变量做处理，获取其初始值
                    if (left.isIdentifier()) {
                        let lp = path.scope.getBinding(left.toString()).path
                        left = lp.get('init')
                    }
                    if (right.isIdentifier()) {
                        let rp = path.scope.getBinding(right.toString()).path
                        right = rp.get('init')
                    }
                    if (!(left.isLiteral() && right.isLiteral() && typeof left.node.value === typeof right.node.value)) {
                        const t = Error.stackTraceLimit
                        Error.stackTraceLimit = 0
                        errs.push(path.buildCodeFrameError(`please replace '${operator}' with '${operator + '='}'`))
                        Error.stackTraceLimit = t
                        if (options.autoFix) {
                            path.node.operator = operator + '='
                        }
                    }
                }



            }

        }
    }
})