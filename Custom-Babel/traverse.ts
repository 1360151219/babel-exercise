// 「简单」记录每个节点的属性
const astDefinationsMap = new Map();
astDefinationsMap.set('Program', {
    visitor: ['body']
});
astDefinationsMap.set('VariableDeclaration', {
    visitor: ['declarations']
});
astDefinationsMap.set('VariableDeclarator', {
    visitor: ['id', 'init']
});
astDefinationsMap.set('Identifier', {});
astDefinationsMap.set('NumericLiteral', {});
astDefinationsMap.set('FunctionDeclaration', {
    visitor: ['id', 'params', 'body']
});
astDefinationsMap.set('BlockStatement', {
    visitor: ['body']
});
astDefinationsMap.set('ReturnStatement', {
    visitor: ['argument']
});
astDefinationsMap.set('BinaryExpression', {
    visitor: ['left', 'right']
});
astDefinationsMap.set('ExpressionStatement', {
    visitor: ['expression']
});
astDefinationsMap.set('CallExpression', {
    visitor: ['callee', 'arguments']
});

class NodePath {
    node:any;
    parent:any;
    parentPath?:NodePath
    constructor(node,parent,parentPath?:NodePath){
        this.node = node
        this.parent = parent
        this.parentPath = parentPath
    }
}
export default function traverse(node, visitor,parent?,parentPath?:NodePath) {
    const curNodeType = node.type
    if(!astDefinationsMap.has(curNodeType)){
        throw new Error("error type");
    }
    // 调用用户自定义的visitor，支持enter&exit
    let visitorFunc = visitor[curNodeType] || {}
    if(typeof visitorFunc === 'function'){
        visitorFunc = {
            enter: visitorFunc
        }
    }
    const path = new NodePath(node,parent,parentPath)
    visitorFunc.enter && visitorFunc.enter(path)
    const nextVisitors = astDefinationsMap.get(curNodeType)?.visitor;
    if(!nextVisitors){
        // 不需要再遍历下去了
        return
    }    
    nextVisitors.forEach(props => {
        const nextNode = node[props]
        if (Array.isArray(nextNode)) {
            nextNode.forEach(n => {
                traverse(n, visitor,node,path)
            })
        } else {
            traverse(nextNode, visitor,node,path)
        }
    });
    visitorFunc.exit && visitorFunc.exit(path)
}