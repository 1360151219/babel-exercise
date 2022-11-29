// 「简单」记录每个节点的属性
const astDefinationsMap = new Map();
astDefinationsMap.set('Program', {
    visitor: ['body'],
    isBlock:true
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
    visitor: ['id', 'params', 'body'],
    isBlock:true
});
astDefinationsMap.set('BlockStatement', {
    visitor: ['body'],
    isBlock:true
});
astDefinationsMap.set('ReturnStatement', {
    visitor: ['argument']
});
astDefinationsMap.set('AssignmentExpression', {
    visitor: ['left', 'right']
});
astDefinationsMap.set('BinaryExpression', {
    visitor: ['left', 'right']
});
astDefinationsMap.set('ExpressionStatement', {
    visitor: ['expression'],
});
astDefinationsMap.set('CallExpression', {
    visitor: ['callee', 'arguments']
});

const getDefinationKeys = () => {
  return [...astDefinationsMap.keys()].map(key=>'is'+key)
}
export {
  astDefinationsMap,
  getDefinationKeys
}