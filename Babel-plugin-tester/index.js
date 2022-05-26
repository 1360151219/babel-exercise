function foo() {
    this.name = 'a'
    console.log(foo.prototype == this.__proto__);

}
foo.prototype.logger = () => {
    console.log('foo');

}
let f = foo()
