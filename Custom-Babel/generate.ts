import { SourceMapGenerator } from 'source-map'
class Printer {
  /**
   * code
   */
  buf: string;
  /**
   * 当前所在的行数
   */
  printLine: number;
  /**
   * 当前所在的列数
   */
  printColumn: number;
  sourceMapGenerator: SourceMapGenerator;
  fileName: string;
  constructor(source, fileName) {
    // sourcemap
    this.sourceMapGenerator = new SourceMapGenerator({
      file: fileName + ".map.json",
    });
    this.fileName = fileName;
    this.sourceMapGenerator.setSourceContent(fileName, source);
    this.buf = '';
    this.printLine = 1;
    this.printColumn = 0;
  }

  addMapping(node) {
    if (node.loc) {
      this.sourceMapGenerator.addMapping({
        generated: {
          line: this.printLine,
          column: this.printColumn
        },
        source: this.fileName,
        original: node.loc && node.loc.start
      })
    }
  }

  space() {
    this.buf += ' ';
    this.printColumn++;
  }

  nextLine() {
    this.buf += '\r\n';
    this.printLine++;
    this.printColumn = 0;
  }

  semicolon() {
    this.buf += ';';
    this.printColumn++;
  }

  comma() {
    this.buf += ',';
    this.printColumn++;
  }

  token(str) {
    this.buf += str;
    this.printColumn += str.length
  }
  Program(node) {
    this.addMapping(node)
    const len = node.body.length;
    node.body.forEach((item, index) => {
      this[item.type](item);
      if (index != len - 1) {
        this.nextLine();
      }
    })
  }

  VariableDeclaration(node) {
    if (!node.declarations.length) {
      return;
    }
    this.addMapping(node);
    this.buf += node.kind;
    this.space();
    node.declarations.forEach((declaration, index) => {
      if (index > 0) {
        this.comma()
      }
      this[declaration.type](declaration);
    });
    this.semicolon()
  }

  VariableDeclarator(node) {
    this.addMapping(node);
    this[node.id.type](node.id);
    if (node.init) {
      this.space()
      this.token('=')
      this.space()
      this[node.init.type](node.init);
    }
  }

  Identifier(node) {
    this.addMapping(node);
    this.buf += node.name
    this.printColumn += node.name.length
  }

  NumericLiteral(node) {
    this.token(node.raw)
  }

  StringLiteral(node) {
    this.token(node.raw)
  }
}

class Generator extends Printer {
  constructor(source, fileName) {
    super(source, fileName)
  }
  generate(node) {
    this[node.type](node)
    return {
      code: this.buf,
      map: this.sourceMapGenerator.toString()
      //..
    }
  }
}
export default function generate(node, source?, fileName?) {
  return new Generator(source, fileName).generate(node);
}