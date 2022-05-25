const { codeFrameColumns } = require("@babel/code-frame");

try {
    throw new Error("xxx 错误");
} catch (err) {
    console.error(codeFrameColumns(`const name = strk`, {
        start: { line: 1, column: 14 },
        end: {
            line: 1, column: 18
        }
    }, {
        highlightCode: true,
        message: err.message
    }));
}