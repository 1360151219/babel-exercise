import { astDefinationsMap,getDefinationKeys } from "./types";

class NodePath {
    node: any;
    parent: any;
    parentPath?: NodePath
    /**
     * 记录当前Node在父节点的属性名称
     */
    key?: string;
    /**
     * 记录当前Node在父节点的数组下标
     */
    listKey?: number;
    constructor(node, parent, parentPath?: NodePath, key?: string, listKey?: number) {
        this.node = node
        this.parent = parent
        this.parentPath = parentPath
        this.key = key
        this.listKey = listKey

        // isXXX 方法
        const keys = getDefinationKeys()
        keys.forEach(key=>{
            this[key] = ()=>{
                return this.node.type === key.slice(2)
            }
        })
        
    }
    replaceWith(node) {
        if (this.listKey) {
            this.key && this.parent[this.key].splice(this.listKey, 1, node);
        } else {
            this.parent[this.key!] = node;
        }
    }
    remove() {
        if (this.listKey) {
            this.key && this.parent[this.key].splice(this.listKey, 1)
        } else {
            this.parent[this.key!] = undefined;
        }
    }
    find(cb) {
        let curPath: NodePath | undefined = this;
        while (curPath && !cb(curPath)) {
            curPath = curPath.parentPath
        }
        return curPath
    }
    findParent(cb) {
        let curPath: NodePath | undefined = this.parentPath;
        while (curPath && !cb(curPath)) {
            curPath = curPath.parentPath
        }
        return curPath
    }
    /**
     * 不需要遍历当前节点，直接从下一个节点开始
     * @param visitor 
     */
    traverse(visitor) {
        const curNodeType = this.node.type
        const nextVisitors = astDefinationsMap.get(curNodeType)?.visitor;
        if (!nextVisitors) {
            // 不需要再遍历下去了
            return
        }
        nextVisitors.forEach(props => {
            const nextNode = this.node[props]
            if (Array.isArray(nextNode)) {
                nextNode.forEach((n, index) => {
                    traverse(n, visitor, this.node, this, props, index)
                })
            } else {
                traverse(nextNode, visitor, this.node, this, props)
            }
        });
    }
    /**
     * 跳过当前节点的子节点的遍历
     */
    skip() {
        this.node._isSkip = true
    }
    /**
     * 打印当前节点的字符串
     */
    toString(){
        // return generate(this.node).code
    }
}
export default function traverse(node, visitor, parent?, parentPath?: NodePath, key?: string, listKey?: number) {
    const curNodeType = node.type
    if (!astDefinationsMap.has(curNodeType)) {
        throw new Error("error type");
    }
    // 调用用户自定义的visitor，支持enter&exit
    let visitorFunc = visitor[curNodeType] || {}
    if (typeof visitorFunc === 'function') {
        visitorFunc = {
            enter: visitorFunc
        }
    }
    const path = new NodePath(node, parent, parentPath, key, listKey)
    visitorFunc.enter && visitorFunc.enter(path)
    const nextVisitors = astDefinationsMap.get(curNodeType)?.visitor;
    if (!nextVisitors || node._isSkip) {
        // 不需要再遍历下去了
        return
    }
    nextVisitors.forEach(props => {
        const nextNode = node[props]
        if (Array.isArray(nextNode)) {
            nextNode.forEach((n, index) => {
                traverse(n, visitor, node, path, props, index)
            })
        } else {
            traverse(nextNode, visitor, node, path, props)
        }
    });
    visitorFunc.exit && visitorFunc.exit(path)
}