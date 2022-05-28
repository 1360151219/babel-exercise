import { declare } from "@babel/helper-plugin-utils"
import generate from "@babel/generator"
import fse from "fs-extra"
import path from "path"
import esdirname from "es-dirname"
const dirname = esdirname()
let key = 1
/**
 * @description: 
 * @param {*} path
 * @param {*} value i18n.t(value)
 * @param {*} uid
 * @return {*}
 */

function generateI18nKey() {
    return `i18n${key++}`
}
export default declare((api, options, dirname) => {

    function getReplaceExpression(path, value, uid) {
        // return : _i18n.t(value)
        let replaceExpression;
        if (path.isTemplateLiteral()) {
            // 这里要用generator方便些，遇到表达式直接generate
            console.log(generate);

            let params = path.node.expressions.map(expression => generate.default(expression).code)
            replaceExpression = api.template(`${uid}.t('${value}',${params.join(',')})`)().expression
        } else {
            replaceExpression = api.template(`${uid}.t('${value}')`)().expression
        }

        if (path.findParent((p) => p.isJSXAttribute()) && !path.findParent(p => p.isJSXExpressionContainer())) {
            // 如果是JSX的属性且外面没有花括号
            replaceExpression = api.types.JSXExpressionContainer(replaceExpression)
        }
        return replaceExpression
    }
    function save(file, key, value) {
        let i18n = file.get('i18n')
        i18n.push({ [key]: value })
        file.set('i18n', i18n)
    }
    api.assertVersion(7)
    return {
        pre(file) {
            file.set('i18n', [])
        },
        visitor: {
            // 预处理
            Program: (path, state) => {
                let imported = false
                path.traverse({
                    ImportDeclaration(p, state) {
                        const source = p.get('source').toString()
                        if (source.slice(1, -1) == "i18n") {
                            imported = true
                            p.stop()
                        }
                    }
                })
                if (!imported) {
                    const uid = path.scope.generateUid("i18n")
                    const ast = api.template(`import ${uid} from 'i18n'`)()
                    path.node.body.unshift(ast)
                    state.uid = uid
                }
                path.traverse({
                    'StringLiteral|TemplateLiteral'(p, state) {
                        if (p.node.leadingComments) {
                            let comments = p.node.leadingComments
                            p.node.leadingComments = comments.filter((comment, index) => {
                                if (comment.value.trim() == 'i18n-disable') {
                                    p.node.isSkip = true
                                    return false
                                }
                                else return true
                            })
                        }
                        // to filter ImportDeclaration
                        if (p.findParent(cp => cp.isImportDeclaration())) {
                            p.node.isSkip = true
                        }
                    }
                })
            },
            StringLiteral: (path, state) => {
                if (path.node.isSkip) return
                let key = generateI18nKey()
                save(state.file, key, path.node.value)
                let expression = getReplaceExpression(path, key, state.uid)
                path.replaceWith(expression)
                path.skip()
            },
            TemplateLiteral: (path, state) => {
                // 对于TemplateLiteral，需要对变量进行占位符替换
                if (path.node.isSkip) return
                let key = generateI18nKey()
                let value = path.node.quasis.map(quais => {
                    return quais.value.raw
                }).join('{placeholder}')

                save(state.file, key, value)
                let expression = getReplaceExpression(path, key, state.uid)
                path.replaceWith(expression)
                path.skip()
            },
        },
        post(file) {
            const i18n = file.get('i18n')
            let res = i18n.reduce(((acc, cur) => {
                return Object.assign(acc, cur)
            }), {})
            const content = `const resource=${JSON.stringify(res, null, 4)}\nexport default resource`
            fse.ensureDirSync(options.output)

            fse.writeFileSync(path.resolve(dirname, options.output, 'en_US.js'), content)
            fse.writeFileSync(path.resolve(dirname, options.output, 'zn_CN.js'), content)




        }
    }
})