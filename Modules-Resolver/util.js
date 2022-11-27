import { readFileSync } from 'fs-extra';
import parser from "@babel/parser"
import { traverse } from '@babel/core'
import { resolve } from 'path'
import { DependencyNode } from '.';
const IMPORT_TYPE = {
  deconstruct: 'deconstruct',
  default: 'default',
  namespace: 'namespace'
}
const EXPORT_TYPE = {
  default: 'default',
  named: 'named'
}
function resolveBabelSyntaxtPlugins(modulePath) {
  const plugins = [];
  if (['.tsx', '.jsx'].some(ext => modulePath.endsWith(ext))) {
    plugins.push('jsx');
  }
  if (['.ts', '.tsx'].some(ext => modulePath.endsWith(ext))) {
    plugins.push('typescript');
  }
  return plugins;
}
function traverseJsModule(curModulePath, root, allModules) {
  const content = readFileSync(curModulePath, {
    encoding: 'utf-8'
  })
  root.path = curModulePath;
  allModules[curModulePath] = root
  const ast = parser.parse(content, {
    sourceType: "unambiguous",
    plugins: resolveBabelSyntaxtPlugins(curModulePath)
  })

  traverse(ast, {
    ImportDeclaration: (path) => {
      const specifiers = path.get('specifiers');
      const source = path.get('source').node.value;
      // TODO:这里不支持跨目录
      const sourceModulePath = resolve(curModulePath, '..', source)
      const subDependencyNode = new DependencyNode(sourceModulePath)
      // dfs
      traverseJsModule(sourceModulePath, subDependencyNode, allModules)
      root.subModules[sourceModulePath] = subDependencyNode;
      root.imports[sourceModulePath] = specifiers.map(specifier => {
        if (specifier.isImportSpecifier()) {
          return {
            local: specifier.get('local').toString(),
            imported: specifier.get('imported').toString(),
            type: IMPORT_TYPE.deconstruct
          }
        } else if (specifier.isImportNamespaceSpecifier()) {
          return {
            local: specifier.get('local').toString(),
            type: IMPORT_TYPE.namespace
          }
        } else if (specifier.isImportDefaultSpecifier()) {
          return {
            local: specifier.get('local').toString(),
            type: IMPORT_TYPE.default
          }
        }
      })
    },
    ExportDeclaration: (path) => {
      console.log(path.node);
      if (path.isExportDefaultDeclaration()) {
        root.exports.push({
          type: EXPORT_TYPE.default,
          exported: path.get('declaration').toString(),
        })
      } else if (path.isExportNamedDeclaration()) {
        const specifiers = path.get('specifiers');

        root.exports.push(specifiers.map(specifier => {
          return {
            local: specifier.get('local').toString(),
            exported: specifier.get('exported').toString(),
            type: EXPORT_TYPE.named
          }
        }))
      }
    }
  })

}

export {
  traverseJsModule
}