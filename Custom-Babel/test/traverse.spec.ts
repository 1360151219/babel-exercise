import { expect, it } from 'vitest'
import Parser from '../index'
import traverse from '../traverse'
function parse(code: string) {
  return Parser.parse(code, {
    locations: true,
    ecmaVersion: 'latest'
  })
}
it("traverse normally",()=>{
  const code = 'let a = 1';
  const ast = parse(code)
  traverse(ast,{
    Identifier:(path)=>{
      path.node.name = 'b'
    }
  })
  expect(ast).toMatchSnapshot("traverse normally")
})

it("traverse enter hook",()=>{
  const code = 'let a = 1';
  const ast = parse(code)
  traverse(ast,{
    Identifier:{
      enter:(path)=>{
        path.node.name = 'c'
      }
    }
  })
  expect(ast).toMatchSnapshot("traverse enter hook")
})