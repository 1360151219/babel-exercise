import { declare } from "@babel/helper-plugin-utils";
export default declare((api, options, dirname) => {
    api.assertVersion(7)
    function isCanExistAfterCompletion(path) {
        if (path.isFunctionDeclaration() || (path.isVariableDeclarator({
            kind: 'var'
        }))) return true
        return false
    }
    return {
        pre: (file) => {

        },
        post: (file) => {

        },
        visitor: {
            BlockStatement: (path, state) => {
                const body = path.get('body')

                let clean = false
                for (let expressionPath of body) {
                    if (expressionPath.isCompletionStatement()) {
                        clean = true
                        continue
                    }
                    if (clean && !isCanExistAfterCompletion(expressionPath)) {
                        expressionPath.remove()
                    }
                }

            },
            Scopable: (path, state) => {
                Object.entries(path.scope.bindings).forEach(([key, binding]) => {
                    if (!binding.referenced) {
                        // path.scope.isPure(node) 判断该节点是否有副作用
                        if (binding.path.get('init').isCallExpression()) {
                            // 声明变量是一个函数调用返回值
                            const leadingComments = binding.path.get('init').node.leadingComments
                            if (leadingComments && leadingComments[0] && leadingComments[0].value.includes('PURE')) {
                                binding.path.remove()
                                return
                            }
                            // 只删除变量声明
                            if (!path.scope.isPure(binding.path.get('init').node)) {
                                binding.path.parentPath.replaceWith(api.types.expressionStatement(binding.path.get('init').node))

                            } else {
                                binding.path.remove()

                            }

                        } else
                            binding.path.remove()


                    }

                });

            }

        }
    }
})