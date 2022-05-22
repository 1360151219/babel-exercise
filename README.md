# Babel Execrise

记录下根据《Babel 插件通关秘籍》掘金小册的学习过程。

涉及到的所有代码均可在[](https://github.com/1360151219/babel-exercise)中找到。

## 案例一：添加自定义代码参数

### 基本需求及解决思路

需求描述：我们经常会打印一些日志来辅助调试，但是有的时候会不知道日志是在哪个地方打印的。希望通过 babel 能够自动在 `console.log` 等 api 中插入文件名和行列号的参数，方便定位到代码。

我们通过[astexplorer.net](https://astexplorer.net/)来查看一下`console.log(2)`的一个 ast 结构：

![](./imgs/console-ast.png)

从结构可以分析，我们只需要通过匹配`CallExpression`中的`MemberExpression`，判断是否是我们指定的 api，如果是，我们就可以在`CallExpression.arguments`中插入我们想要的信息。
  
代码的行列号参数在`CallExpression.loc`中。

### 涉及的 api

基本架构：
 

```js
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const types = require("@babel/types");

const ast = parser.parse(sourceCode, {
  // parser 需要指定代码是不是包含 import、export 等，需要设置 moduleType 为 module 或者 script，我们干脆设置为 unambiguous，让它根据内容是否包含 import、export 来自动设置 moduleType。
  sourceType: "unambiguous",
  plugins: ["jsx"], // 设置插件
});

traverse(ast, {
  CallExpression(path, state) {},
});

const { code, map } = generate(ast);
console.log(code);
```

- `path.get().toString()` 获取其中具体 ast 的代码
- `generator(ast).code` 与上效果一样
- `path.insertBefore ` 插入 ast
- `path.replaceWith()`代替节点
- `path.findParent()`找到当前 path 的父节点
- `path.isJSXElement()`
- `path.skip()`跳过当前节点子节点的遍历
