import { Parser } from "acorn";

export default (parserCtx: typeof Parser) => {
  return class extends parserCtx {
    parseLiteral(...args: any[]) {
      //@ts-ignore
      const node = super.parseLiteral(...args);
      debugger;
      switch (typeof node.value) {
        case 'number':
          node.type = 'NumericLiteral'
          break;
        case 'string':
          node.type = 'StringLiteral'
          break;
          // TODO：这里不生效不知道为什么
        case 'boolean':
          node.type = 'BooleanLiteral'
          break;
        default:
          node.type = 'hello'
          break;
      }
      return node
    }
  }
}