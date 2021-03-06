module.exports = function (babel) {
    const { types: t } = babel;
    return {
        name: "ast-transform", // not required
        visitor: {
            Identifier(path) {
                path.node.name = "hh";
            }
        }
    };
}
