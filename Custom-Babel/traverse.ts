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

export default function traverse(node, visitor) {
    const curNodeType = node.type
    if(!astDefinationsMap.has(curNodeType)){
        throw new Error("error type");
    }
    visitor[curNodeType] && visitor[curNodeType](node)
    const nextVisitors = astDefinationsMap.get(curNodeType)?.visitor;
    if(!nextVisitors){
        // 不需要再遍历下去了
        return
    }    
    nextVisitors.forEach(props => {
        const nextNode = node[props]
        if (Array.isArray(nextNode)) {
            nextNode.forEach(n => {
                traverse(n, visitor)
            })
        } else {
            traverse(nextNode, visitor)
        }
    });
}