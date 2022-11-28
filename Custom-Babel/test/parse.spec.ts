import { expect, it } from 'vitest'
import Parser from '../index'
function parse(code: string) {
  return Parser.parse(code, {
    locations: true,
    ecmaVersion: 'latest'
  })
}
it("parse numberLiteral", () => {
  const code = 'let a = 1;'
  expect(parse(code)).toMatchSnapshot("numberLiteral")
})
it("parse stringLiteral", () => {
  const code = 'let a = "I am a string";'
  expect(parse(code)).toMatchSnapshot("stringLiteral")
})
// 这个有问题
it("parse booleanLiteral", () => {
  const code = 'let a = true;'
  const res = parse(code)
  expect(res).toMatchSnapshot("booleanLiteral")
})