import { expect, it } from 'vitest'
import Parser from '../index'
import traverse from '../traverse'
function parse(code: string) {
  return Parser.parse(code, {
    locations: true,
    ecmaVersion: 'latest'
  })
}
it("traverse",()=>{
  const code = 'let a = 1';
  const ast = parse(code)
  traverse(ast,{
    Identifier:(node)=>{
      node.name = 'b'
    }
  })
  expect(ast).toMatchSnapshot("traverse")
})