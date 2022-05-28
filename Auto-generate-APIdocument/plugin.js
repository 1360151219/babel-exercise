import { declare } from "@babel/helper-plugin-utils"
import fse from "fs-extra"
import esDirname from "es-dirname"
import path from "path"
import doctrine from 'doctrine'
import rerender from "./rerender/index.js"

const dirname = esDirname()

function generateDoc(docs, format = 'json') {
    switch (format) {
        case 'json':
            return {
                ext: '.json',
                content: rerender.json(docs)
            }
    }
}
export default declare((api, options, dirname) => {
    api.assertVersion(7)
    function resolveType(annotation) {
        // TypeAnnotationPath.getTypeAnnotation()
        const type = annotation.getTypeAnnotation().type

        if (type == 'AnyTypeAnnotation') {
            return "any"
        }
        switch (type) {
            case 'TSStringKeyword':
                return 'string'
            case 'TSNumberKeyword':
                return 'number'
            case 'TSBooleanKeyword':
                return 'boolean'
        }
    }
    // function parseComments(commentsPaths) {
    //     let ans;
    //     ans = commentsPaths.map((commentPath) => {
    //         return commentPath.node.value
    //     })
    //     return ans.join('\n')

    // }
    function parseComments(commentsPaths) {
        //  将注释转换为AST格式
        let comment = commentsPaths.map((commentPath) => {
            return commentPath.node.value
        }).join('\n')
        if (!comment) return
        return doctrine.parse(comment, {
            unwrap: true
        });
    }
    return {
        pre(file) {
            file.set('docs', [])
        },
        visitor: {
            FunctionDeclaration(path, state) {
                let docs = state.file.get('docs')
                let returnTypeAnnotation = path.get('returnType')
                let comments = path.get('leadingComments')
                docs.push({
                    type: 'function',
                    id: path.get('id').toString(),
                    params: path.get('params').map((param) => {
                        let typeAnnotation = param.get('typeAnnotation')
                        return {
                            name: param.node.name,
                            typeAnnotation: resolveType(typeAnnotation),
                        }
                    }),
                    returnType: resolveType(returnTypeAnnotation),
                    description: parseComments(comments)

                })
                state.file.set('docs', docs)

            },
            ClassDeclaration(path, state) {
                let docs = state.file.get('docs')
                const comments = path.get("leadingComments")
                const classDoc = {
                    type: 'class',
                    id: path.get('id').toString(),
                    description: parseComments(comments),
                    body: []
                }
                path.traverse({
                    ClassProperty(p, state) {
                        classDoc.body.push({
                            type: 'classProperty',
                            id: p.get('key').toString(),
                            typeAnnotation: resolveType(p.get('typeAnnotation'))
                        })
                    },
                    ClassMethod(p, state) {
                        const comments = p.get("leadingComments")
                        // console.log(resolveType(p.get('returnType')));

                        classDoc.body.push({
                            type: 'classMethod',
                            id: p.get('key').toString(),
                            params: p.get('params').map((param) => {
                                let typeAnnotation = param.get('typeAnnotation')
                                return {
                                    name: param.node.name,
                                    typeAnnotation: resolveType(typeAnnotation),
                                }
                            }),
                            returnType: resolveType(p.get('returnType')),
                            description: parseComments(comments)
                        })
                    }
                })
                docs.push(classDoc)
                state.file.set('docs', docs)
            },
        },
        post(file) {
            let docs = file.get('docs')
            fse.ensureDirSync(options.output)
            let res = generateDoc(docs, options.format)
            fse.writeFileSync(path.resolve(dirname, options.output, 'docs' + res.ext), res.content)
        }
    }
})