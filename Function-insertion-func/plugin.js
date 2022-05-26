import { addDefault } from "@babel/helper-module-imports"

// addDefault(path, 'source', { nameHint: "hintedName" })
export default function ({ types: t, template: template }, options) {
    return {
        visitor: {
            Program: (path, state) => {
                // 判断有没有引入过
                path.traverse({
                    ImportDeclaration(childPath) {
                        const importPath = childPath.get("source").node.value
                        if (importPath == options.targetPath) {
                            const specifiers = childPath.get("specifiers")[0];
                            // 这里不用做判断 直接获取local即可
                            if (specifiers.isImportSpecifier) {
                                state.id = specifiers.get("local").toString()
                            }
                        }
                        // path.stop()
                    }
                })
                // 若没有
                if (!state.id) {
                    state.id = addDefault(path, 'tracker', {
                        nameHint: path.scope.generateUid('tracker')
                    }).name
                    const trackAST = template(`${state.id}()`)()
                    state.trackAST = trackAST
                }
            },
            'FunctionDeclaration|ClassMethod|ArrowFunctionExpression|FunctionExpression'(path, state) {
                const leadingComments = path.node.leadingComments
                if (leadingComments) {
                    for (let comment of leadingComments) {
                        if (comment.value.trim() == "track-disable") {
                            return
                        }
                    }
                }
                const bodyPath = path.get("body")
                if (bodyPath.isBlockStatement()) {
                    bodyPath.node.body.unshift(state.trackAST)
                } else { // 没有body
                    let res = bodyPath
                    // 外面用花括号包裹，是相当于用BlockStatement包住
                    const ast = template(`{${state.id}();return RES}`)({
                        RES: res.node.value
                    })
                    console.log(ast);

                    bodyPath.replaceWith(ast)
                }
            }
        },
    };
}