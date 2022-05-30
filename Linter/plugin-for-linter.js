// for(let i=0;i<10;i--) & for(let i=10;i>0;i++)
import { declare } from "@babel/helper-plugin-utils"

export default declare((api, options, dirname) => {
    api.assertVersion(7)
    return {
        pre(file) {
            file.set('errs', [])
        },
        visitor: {
            ForStatement(path, state) {
                const errs = state.file.get('errs')
                let shouldOperator = ''

                if (path.node.test.type != 'SequenceExpression' && path.node.update.type != 'SequenceExpression') {
                    // 单个表达式
                    const testOperator = path.node.test.operator
                    const updateOperator = path.node.update.operator
                    if (['<', '<='].includes(testOperator) && updateOperator !== (shouldOperator = '++')) {
                        // throw path.get('update').buildCodeFrameError('decrease loop', Error)
                        Error.stackTraceLimit = 0
                        errs.push(path.get('update').buildCodeFrameError('decrease loop', Error))

                    }
                    if (['>', '>='].includes(testOperator) && updateOperator !== (shouldOperator = '--')) {
                        Error.stackTraceLimit = 0
                        errs.push(path.get('update').buildCodeFrameError('increase loop', Error))
                    }
                } else {
                    // 多个表达式
                    const testOperators = new Map()
                    for (let testExpression of path.get('test').get('expressions')) {
                        testOperators.set(testExpression.get('left').toString(), testExpression.node.operator)
                    }
                    path.get('update').get('expressions').forEach((updateExpression, index) => {
                        let updateId = updateExpression.get('argument').toString()
                        let updateOperator = updateExpression.node.operator
                        if (['<', '<='].includes(testOperators.get(updateId)) && updateOperator !== (shouldOperator = '++')) {
                            // throw path.get('update').buildCodeFrameError('decrease loop', Error)


                            Error.stackTraceLimit = 0
                            errs.push(updateExpression.buildCodeFrameError('decrease loop', Error))

                        }
                        if (['>', '>='].includes(testOperators.get(updateId)) && updateOperator !== (shouldOperator = '--')) {
                            Error.stackTraceLimit = 0
                            errs.push(updateExpression.buildCodeFrameError('increase loop', Error))

                        }
                    })
                }
            }
        },
        post(file) {
            console.log(file.get('errs'));

        }
    }
})