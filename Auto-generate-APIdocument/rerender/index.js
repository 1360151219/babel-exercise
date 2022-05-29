import markdown from "./markdown.js"
export default {
    json: (obj) => JSON.stringify(obj, null, 4),
    markdown,
}