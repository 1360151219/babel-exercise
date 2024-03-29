import { expect, test, describe} from 'vitest'
import parse from '../index'
import generate from '../generate'

describe("generate test", ()=>{
  test('generate Program', () => {
    const code = ''
    const ast = parse(code)
    const res = generate(ast,code,'css.js').code
    expect(res).toEqual('')
  })
  test('generate VariableDeclaration', () => {
    const code = 'let a,b = 1,c = "c";'
    const ast = parse(code)
    const res = generate(ast,code,'a.js')
    expect(res.code).toEqual('let a,b = 1,c = "c";')
    expect(res.map).toMatchSnapshot('sourceMap')
  })
})