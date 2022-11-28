import { Parser } from "acorn"
import literal from "./plugins/literal";
export default Parser.extend(literal);
