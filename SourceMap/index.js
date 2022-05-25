const { SourceMapGenerator } = require("source-map")
var map = new SourceMapGenerator({
    file: "source-mapped.js"
});

map.addMapping({
    generated: {
        line: 10,
        column: 35
    },
    source: "foo.js",
    original: {
        line: 10,
        column: 35
    },
    name: "christopher"
});

console.log(map.toString());
// '{"version":3,"file":"source-mapped.js",
//   "sources":["foo.js"],"names":["christopher"],"mappings":";;;;;;;;;mCAgCEA"}'