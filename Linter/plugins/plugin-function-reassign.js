import { declare } from "@babel/helper-plugin-utils";

export default declare((api, options, dirname) => {
    api.assertVersion(7)
    return {
        pre: (file) => {
            file.set('errs', [])
        },
        post: (file) => {
            console.log(file.get('errs'));
        },
        visitor: {
            AssignmentExpression: (path, state) => {
                const errs = state.file.get('errs')
                const id = path.get('left').toString()
                const binding = path.scope.getBinding(id)
                if (binding) {
                    let bp = binding.path
                    if (bp.isFunctionDeclaration || bp.isFunctionExpression) {
                        let t = Error.stackTraceLimit
                        Error.stackTraceLimit = 0
                        errs.push(path.buildCodeFrameError("Can't reassign to a Function !", Error))
                        Error.stackTraceLimit = t
                    }

                }

            }

        }
    }
})