const acorn = require("acorn");

const Parser = acorn.Parser;
const tt = acorn.tokTypes;
const TokenType = acorn.TokenType;

Parser.acorn.keywordTypes["strk2"] = new TokenType("strk2", { keyword: "strk2" });

/* var TokenType = function TokenType(label, conf) {
    if (conf === void 0) conf = {};
    this.label = label;
    this.keyword = conf.keyword;
    this.beforeExpr = !!conf.beforeExpr;
    this.startsExpr = !!conf.startsExpr;
    this.isLoop = !!conf.isLoop;
    this.isAssign = !!conf.isAssign;
    this.prefix = !!conf.prefix;
    this.postfix = !!conf.postfix;
    this.binop = conf.binop || null;
    this.updateContext = null;
}; */

module.exports = function (Parser) {
    return class extends Parser {
        // 入口方法
        parse(program) {
            var newKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this const class extends export import super";
            newKeywords += " strk2";// 增加一个关键字
            this.keywords = new RegExp("^(?:" + newKeywords.replace(/ /g, "|") + ")$")
            // /^(?:break|case|catch|continue|debugger|default|do|else|finally|for|function|if|return|switch|throw|try|var|while|with|null|true|false|instanceof|typeof|void|delete|new|in|this|const|class|extends|export|import|super|strk2)$/

            return (super.parse(program));
        }

        parseStatement(context, topLevel, exports) {
            let tokenType = this.type

            if (tokenType == Parser.acorn.keywordTypes["strk2"]) {
                // console.log(tokenType);
                let node = this.startNode()

                return this.parseStrk2Statement(node)

            }
            else {
                return (super.parseStatement(context, topLevel, exports));
            }

        }
        parseStrk2Statement(node) {
            this.next()
            return this.finishNode({ value: "strk2" }, "Strk2Statement")
        }
    }
}