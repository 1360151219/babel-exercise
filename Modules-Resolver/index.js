import { traverseJsModule } from './util'
export class DependencyNode {
  constructor(path = '', imports = {}, exports = []) {
    /**
     * 模块路径
     */
    this.path = path;
    this.imports = imports;
    this.exports = exports;
    this.subModules = {}
  }
}

// main: getDependencyGraph
export default function (curModulePath) {
  const dependencyGraph = {
    root: new DependencyNode(),
    allModules: {}
  };
  traverseJsModule(curModulePath, dependencyGraph.root, dependencyGraph.allModules);
  return dependencyGraph;
}