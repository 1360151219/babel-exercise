import { expect, it } from 'vitest'
import parse from '../index'
import traverse from '../traverse'

it("traverse normally", () => {
  const code = 'let a = 1';
  const ast = parse(code)
  traverse(ast, {
    Identifier: (path) => {
      path.node.name = 'b'
    }
  })
  expect(ast).toMatchSnapshot("traverse normally")
})

it("traverse enter hook", () => {
  const code = 'let a = 1';
  const ast = parse(code)
  traverse(ast, {
    Identifier: {
      enter: (path) => {
        path.node.name = 'c'
        console.log(path);

      }
    }
  })
  expect(ast).toMatchSnapshot("traverse enter hook")
})

it("traverse replaceWith api", () => {
  const code = 'foo(a)';
  const ast = parse(code)
  traverse(ast, {
    Identifier: (path) => {
      if (path.findParent(p => p.isCallExpression()) && path.node.name === 'a') {
        path.replaceWith({ type: 'Identifier', name: 'hello' })
      }
    }
  })
  expect(ast).toMatchSnapshot("traverse replaceWith api")
})
