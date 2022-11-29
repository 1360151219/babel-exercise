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

it("traverse remove unReferenced FcuntionDeclaration", () => {
  const code = 'let a = 1;let b = 2;function foo(){}b = a+2;';
  const ast = parse(code)
  const bindings: string[] = []
  const filteredBindings: string[] = []
  traverse(ast, {
    Program(path) {
      Object.entries<any>(path.scope.bindings).forEach(([id, binding]) => {
        bindings.push(id);
        if (!binding.referenced) {
          binding.path.remove();
          return
        }
        filteredBindings.push(id);
      });
    },
    FunctionDeclaration(path) {
      console.log(path.scope);
      Object.entries<any>(path.scope.bindings).forEach(([id, binding]) => {
        if (!binding.referenced) {
          let index = filteredBindings.indexOf(id);
          filteredBindings.splice(index, 1);
          binding.path.remove();
        }
      });
    }
  })
  expect(bindings).toEqual(['a', 'b', 'foo'])
  expect(filteredBindings).toEqual(['a', 'b'])
  expect(ast).toMatchSnapshot("traverse remove unReferenced FcuntionDeclaration")
})

it("traverse remove unReferenced identifier", () => {
  const code = 'let a = 1;';
  const ast = parse(code)
  let filteringBindings: string[] = [];
  traverse(ast, {
    Program(path) {
      Object.entries<any>(path.scope.bindings).forEach(([id, binding]) => {
        // bindings.push(id);
        if (!binding.referenced) {
          filteringBindings.push(id);
          // 这里remove之后，还会继续traverse下去，因此要在traverse判断一下node是否存在
          binding.path.remove();
        }
      });
    }
  })
  // expect(bindings).toEqual(['a','b','foo'])
  expect(filteringBindings).toEqual(['a'])
  expect(ast).toMatchSnapshot("traverse remove unReferenced iddentifier")
})