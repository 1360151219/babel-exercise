# Babel Execrise

记录下根据《Babel 插件通关秘籍》掘金小册的学习过程。

涉及到的所有代码均可在[Github](https://github.com/1360151219/babel-exercise)中找到。

以下有些练习和知识点在这里[学习知识点笔记](http://www.strk2.cn/views/frontend/Compiler/Babel-execrise.html)

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

## 案例二：对 acorn 进行 ast 节点拓展

### 思路分析

首先要创建新的分词（token），即让 parser 知道你的新关键词。

然后要重新 acorn Parser 中的 keywords 属性

分词弄好后，要进行语法分析，acorn 对不同类型的节点都会调用`parseXxx`方法，我们重写`parseStatement`方法，组装新的 ast 节点

### 涉及到 API

- `Parser.acorn.keywordTypes`:Parser 的一个关键词 token 数组
- `Parser.startNode()`：创建一个空 ast 节点

```js
var Node = function Node(parser, pos, loc) {
  this.type = "";
  this.start = pos;
  this.end = 0;
  if (parser.options.locations) {
    this.loc = new SourceLocation(parser, loc);
  }
  if (parser.options.directSourceFile) {
    this.sourceFile = parser.options.directSourceFile;
  }
  if (parser.options.ranges) {
    this.range = [pos, 0];
  }
};
```

- `Parser.next()`: 消费当前 token，生成 AST，继续向下一个 token

- `Parser.finishNode()`：结束当前节点

```js
function finishNodeAt(node, type, pos, loc) {
  node.type = type;
  node.end = pos;
  if (this.options.locations) {
    node.loc.end = loc;
  }
  if (this.options.ranges) {
    node.range[1] = pos;
  }
  return node;
}

pp$2.finishNode = function (node, type) {
  return finishNodeAt.call(
    this,
    node,
    type,
    this.lastTokEnd,
    this.lastTokEndLoc
  );
};
```

## 练习一：@babel/code-frame 的使用和大概原理

## 练习二：babel-plugin-tester 的使用

## 练习三：@babel/preset-env 配置

## 案例三：函数自动埋点插桩

### 思路分析

首先判断有没有引入过目标文件，没有则通过 `@babel/helper-module-imports` 引入，并且记录下唯一 id 和生成好 AST

然后匹配到目标函数，插入即可。（注意对特殊函数做特殊处理）

**额外思考**

通过匹配函数中的`leadingComments`来进行决定是否插入埋点

## 案例四：自动转换国际化--i18n

### 主要思路

首先引入 i18n 模块，遍历处理`TemplateLiteral|StringLiteral`，转换成对应的`i18n.t(value)`节点，并且同时记录下原字符串，生成对应的语言文件。

## 案例五：根据注释或者 ts 类型自动生成 api 文档

> 这里我是基于 typescript 的实现

- `doctrine`:将注释转换成 AST 格式。（作者不再维护）
- `path.getTypeAnnotation()`：等同于`path.get('typeAnnotation').node`

完善了一下 AST 解析的情况：

- 支持更多的类型解析
- 加入了`interface`以及泛型的解析
- 对象字面量的解析

## 案例六：Linter

- `path.buildCodeFrameError(msg,Error)`：构造一个 code frame，标记出当前 path 的位置
- `Error.stackTraceLimit`：修改报错信息堆栈

### 判断 for 循环--loop linter

获取`ForStatement`中的`test`和`update`，判断方向和符号是否导致死循环，比如`for(let i=0;i<10;i--)`

如果`test`有多个 expression，则使用 Map 将其都记录下来，再去遍历 update 进行判断

### 函数无法再次赋值

通过遍历`AssignmentExpression`获取其 id，然后通过`path.scope.getBinding(id)`去判断其 binding 节点是否是 Function。

### 识别且修复‘==’&‘!=’

类似思路....

## 案例七：Type Checker

- 普通的赋值语句类型检查
- 函数调用参数类型检查
- 泛型类型检查
- 条件类型泛型类型检查

主要的思路基本一致：将声明好的函数或者泛型类型跟实际上传入的参数类型做对比即可。

## 案例八：代码混淆和代码压缩

### 混淆

- 访问所有有作用域的节点(别名为`Scopable`)
- 利用`path.scope.bindings`获取作用域内所有 bindsing
- 遍历每一个 bindings，如果没有被混淆过，就使用`path.scope.rename()`方式进行混淆

### 压缩

#### 将 return 后面的语句删除

- 删除 `return` 之后的语句，就是要找到函数声明 `FunctionDeclaration` 的函数体，遍历一遍 body 的 AST，如果是 `return` 之后就打个标记之后删除。
- 但是要注意，`return` 之后是可以有函数声明的，会做变量提升，还有如果是 `var` 声明的变量，也会做提升，所以要去掉这两种情况。

```js
判断是否是 var 关键字声明的变量：

path.isVariableDeclarator({ kind: "var" });

删除节点
path.remove()
```

#### 将声明但是没有引用的变量删除

- 通过遍历`Scopable`，将所有的 bindings 都遍历一遍
- 通过判断`binding.referenced`，如果为`false`就是没有被引用，可以删除
- 在删除之前还需要判断其是否有副作用：
  - 是否是调用函数返回值，是的话要保留调用函数语句
  - 使用`path.scope.isPure(node)` 来进行判断
  - 根据注释来判断

## 案例九：实现一个JS解释器

基本思路：首先通过`babelParser`生成AST，从AST头部开始向下遍历整棵树（深度遍历），进行相应node的解析。「注意」：这里需要处理作用域链，使用一个类似哈希表的链表即可实现。

## 案例十: 实现一个模块遍历器

Modules-Resolver

基本思路：通过ast解析`ImportDeclaration`和`ExportDeclaration`来对每一个模块进行分析，构建成一个模块依赖图。

## 手写一个简易版Babel

1. Babel Parser

在之前的学习中我们知道Babel使用的是继承自`Acorn`自己实现的Parser，这里我们将拓展一下`Literal`节点的类型，即重写`parseLiteral`方法。

2. traverse

从根节点`Program`开始，进行整棵AST的深度遍历即可，同时加上`visitor`模式的操作。

3. path api

构建一个`NodePath`类，实现基本方法。

4. scope api

在所有`block`节点中都可以创建一个`scope`，创建时需要遍历父级scope，将所有bindings绑定在其上。。（优化：在`NodePath`获取`scope`的时候才创建。）