import { declare } from "@babel/helper-plugin-utils";

export default declare((api, options, dirname) => {
    api.assertVersion(7)
    function resolveType(typeAnnotation, referenceMap = {}, state) {
        const TypeMap = {
            'TSStringKeyword': 'string',
            'TSNumberKeyword': 'number'
        }
        switch (typeAnnotation.type) {
            case 'TSTypeAnnotation': {
                // 先处理泛型
                if (typeAnnotation.typeAnnotation.type === 'TSTypeReference') {
                    return referenceMap[typeAnnotation.typeAnnotation.typeName.name]
                }
                return TypeMap[typeAnnotation.typeAnnotation.type];
            }

            case 'NumberTypeAnnotation':
            case 'TSNumberKeyword':
                return 'number';
            case 'StringTypeAnnotation':
            case 'TSStringKeyword':
                return 'string';
            case 'BooleanTypeAnnotation':
                return 'boolean'
            case 'TSTypeReference': {
                // 高级类型
                // typeAlias 记录着类型别名的定义
                // typeAnnotation是遍历到实际泛型
                const typeAlias = state[typeAnnotation.typeName.name]
                const typeParameters = typeAnnotation.typeParameters.params.map((item) => {
                    // todo .. 联合类型判断
                    return resolveType(item)
                })
                let map = typeAlias.paramNames.reduce((acc, cur, index) => {
                    acc[cur] = typeParameters[index]
                    return acc
                }, {})
                // todo 
                return evalType(typeAlias, map)

            }
            case 'TSLiteralType': {
                return typeAnnotation.literal.value
            }

        }
    }
    function evalType(node, map) {
        // map:存贮着泛型的映射关系
        const checkType = node.body.checkType
        const extendsType = node.body.extendsType
        const trueType = node.body.trueType
        const falseType = node.body.falseType
        let check;
        if (checkType.type === 'TSTypeReference') {
            // 泛型:Res<T>的T
            check = map[checkType.typeName.name]
        } else check = resolveType(checkType)
        let extend = resolveType(extendsType)
        console.log(map);

        if (check === extend || check instanceof extend) {
            return resolveType(trueType)
        } else {
            return resolveType(falseType)
        }
    }
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
                const leftBinding = path.scope.getBinding(path.get('left'))
                const leftTypeNode = leftBinding.path.get('id').getTypeAnnotation()
                const leftType = resolveType(leftTypeNode)
                const rightType = resolveType(path.get("right").getTypeAnnotation())
                if (leftType !== rightType) {
                    const t = Error.stackTraceLimit
                    const msg = `${rightType} can not assign to ${leftType}`
                    Error.stackTraceLimit = 0
                    errs.push(path.get('right').buildCodeFrameError(msg, Error))
                    Error.stackTraceLimit = t
                }
            },
            CallExpression: (path, state) => {
                // callee找到函数声明中的参数类型和arguments作对比

                // 泛型检查
                let realTypes = []
                if (path.get('typeParameters').node) {
                    realTypes = path.node.typeParameters.params.map(item => {
                        return resolveType(item, {}, state);
                    });
                }

                const errs = state.file.get('errs')
                const calleePath = path.scope.getBinding(path.get('callee')).path
                // 泛型的类型映射
                const realTypeMap = {}
                if (calleePath.get('typeParameters').node) {
                    calleePath.node.typeParameters.params.map((item, index) => {
                        realTypeMap[item.name] = realTypes[index]
                    });
                }
                // 定义中本应该的参数类型
                const calleeParamsTypes = calleePath.get('params').map((param) => {
                    return resolveType(param.getTypeAnnotation(), realTypeMap)
                })
                // 函数实际接收的参数类型
                const curParamsTypes = path.get('arguments').map((param) => {
                    return resolveType(param.getTypeAnnotation())
                })
                for (let i = 0; i < calleeParamsTypes.length; i++) {
                    if (calleeParamsTypes[i] !== curParamsTypes[i]) {
                        const t = Error.stackTraceLimit
                        const msg = `${curParamsTypes[i]} can not assign to ${calleeParamsTypes[i]}`
                        Error.stackTraceLimit = 0
                        errs.push(path.get('arguments')[i].buildCodeFrameError(msg, Error))
                        Error.stackTraceLimit = t
                    }
                }
            },


            TSTypeAliasDeclaration: (path, state) => {
                state[path.get('id').toString()] = {
                    paramNames: path.node.typeParameters.params.map(item => {
                        return item.name;
                    }),
                    body: path.getTypeAnnotation()
                };

                // const id = path.get('id').toString()
                // const typeParameter = path.get('typeParameters').node.params.map((param) => {
                //     return param.name
                // })
                // if (path.getTypeAnnotation().checkType.type === 'TSTypeReference') {
                //     const checkType = map[path.getTypeAnnotation().checkType.typeName.name]
                // } else {
                //     const checkType = resolveType(path.getTypeAnnotation().checkType)
                // }

                // const extendsType = path.getTypeAnnotation().extendsType.literal.value
                // const falseType = resolveType(path.getTypeAnnotation().falseType)
                // const trueType = resolveType(path.getTypeAnnotation().trueType)
                // console.log(path.getTypeAnnotation());
                // console.log(falseType, trueType);
            }
        }
    }
})