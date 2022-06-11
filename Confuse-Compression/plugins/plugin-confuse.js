import { declare } from "@babel/helper-plugin-utils"
const base54 = (num) => {
    const DIGITS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_'
    let ans = ''
    // do while 当num第一次为0时也可以正常生成
    do {
        ans = DIGITS.charAt(num % 54) + ans
        num = Math.floor(num / 54)
    } while (num > 0)
    return ans
}
export default declare((api, options, dirname) => {
    api.assertVersion(7)
    return {
        pre: (file) => {
            file.set('uid', 0)
        },
        post: (file) => {

        },
        visitor: {
            // 目的是为了找出所有的声明，那就要遍历所有会生成作用域的节点，
            //包括 FunctionDeclaration、BlockStatement 等，而这些节点又一个别名
            //，叫 Scopable
            Scopable: (path, state) => {
                let uid = state.file.get('uid')
                // console.log(uid);

                Object.entries(path.scope.bindings).forEach(([key, binding], index) => {
                    if (binding.confused) return
                    else {
                        if (Object(binding.path.node.init).leadingComments) {
                            for (let c of Object(binding.path.node.init).leadingComments) {
                                if (c.value == "@__PURE__") return
                            }
                        }
                        binding.confused = true
                        const newName = binding.scope.generateUid(base54(uid++))
                        binding.path.scope.rename(key, newName)
                    }

                })
                state.file.set('uid', uid)


            }
        }
    }
})