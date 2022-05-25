const pluginTester = require('babel-plugin-tester').default
const identifierReversePlugin = require('./plugin.js')

pluginTester({
    plugin: identifierReversePlugin,
    tests: {
        'case1:': 'const a=1;', // 输入输出都是同个字符串
        'case2:': { // 指定输入输出的字符串
            code: 'const a=1;',
            output: 'const hh = 1;',
        },
        'case3:xxxxxx': { // 指定输入字符串，输出到快照文件中，对比测试
        code: `
        const a = 1;
      `,
            snapshot: true,
        },
    }
})