import { Parser } from "acorn"
import literal from "./plugins/literal";
const MyParser = Parser.extend(literal);
export default function parse(code: string) {
  return MyParser.parse(code, {
    locations: true,
    ecmaVersion: 'latest'
  })
}
