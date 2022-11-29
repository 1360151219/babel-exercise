import { astDefinationsMap, getDefinationKeys } from "./types";

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
    _scope?:Scope;
    constructor(node, parent, parentPath?: NodePath, key?: string, listKey?: number) {
        this.node = node
        this.parent = parent
        this.parentPath = parentPath
        this.key = key
        this.listKey = listKey

        // isXXX 方法
        const keys = getDefinationKeys()
        keys.forEach(key => {
            this[key] = () => {
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
    /**
     * 删除node层面上
     */
    remove() {
        if (this.listKey) {
            this.key && this.parent[this.key].splice(this.listKey, 1)
        } else {
            this.parent[this.key!] = undefined;
        }
        console.log(this.parent);
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
    toString() {
        // return generate(this.node).code
    }
    isBlock(){
        return astDefinationsMap.get(this.node.type).isBlock;
    }
    /**
     * Scope
     */
    get scope(){
        if(this._scope) return this._scope;
        const parentScope = this.parentPath && this.parentPath.scope;
        return this._scope = this.isBlock() ? new Scope(this,parentScope) : parentScope
    }
}
class Binding {
    id: number;
    path: NodePath;
    referenced: boolean;
    referencePaths: NodePath[];
    constructor(id, path, scope?, kind?) {
        this.id = id;
        this.path = path;
        this.referenced = false;
        this.referencePaths = [];
    }
}
class Scope {
    parent?: Scope;
    path: NodePath;
    bindings: any;
    constructor(path: NodePath, parent?: Scope, bindings = {}) {
        this.path = path
        this.parent = parent
        this.bindings = bindings

        path.traverse({
            VariableDeclarator:(path)=>{
                this.registerBinding(path.node.id.name,path)
            },
            FunctionDeclaration:(path)=>{
                // 函数有自己的独立作用域
                path.skip()
                this.registerBinding(path.node.id.name,path)
            }
        })

        path.traverse({
            Identifier:(path)=>{
                // 是引用声明而不是定义声明
                if(!path.findParent(p=>p.isFunctionDeclaration()||p.isVariableDeclarator())){
                    const binding = this.getBinding(path.node.name)
                    if(binding){
                        binding.referenced = true
                        binding.referencePaths.push(path)
                    }
                }
            }
        })
    }
    registerBinding(id: string, path: NodePath) {
        this.bindings[id] = new Binding(id, path)
    }
    getOwnBinding(id: string){
        return this.bindings[id]
    }
    getBinding(id: string){
        let binding = this.getOwnBinding(id)
        let cur: Scope = this;
        while(!binding&&cur.parent){
            binding = cur.parent.getOwnBinding(id);
            cur = cur.parent
        }
        return binding
    }
    hasBinding(id: string) {
        return !!this.getBinding(id);
    }
}


export default function traverse(node, visitor, parent?, parentPath?: NodePath, key?: string, listKey?: number) {
    if(!node) return;
    const curNodeType = node.type
    if (!astDefinationsMap.has(curNodeType)) {
        throw new Error("error type:"+curNodeType);
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