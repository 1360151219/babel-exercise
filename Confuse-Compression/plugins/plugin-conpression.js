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
                        
                    }

                });

            }

        }
    }
})