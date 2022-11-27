import { expect, test } from 'vitest'
import path from 'path'
import getDependencyGraph from '../index.js'
function add(a, b) {
  return a + b
}

test('single module graph', () => {
  const graph = JSON.stringify(getDependencyGraph(path.resolve(__dirname, './module1.js')), null, 4)
  console.log(graph);
  expect(graph).toMatchSnapshot('dependencyGraph')
})

