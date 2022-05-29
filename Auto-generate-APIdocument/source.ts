interface IObj<T, K> {
    a: number
    b: K
    c: Array<T>
}
/**
 * @description: Hi 你好
 * @param {string} name
 * @param {number} age
 * @param {boolean} a
 * @return {string}
 */
function sayHi(name: string, age: number, a: boolean): string {
    console.log(`hi, ${name}`);
    return `hi, ${name}`;
}
// string[]
function printName(names: Array<string>): void {
    console.log(names.join(','));
}
function printObjectSum(obj: IObj<boolean, number>): number {
    return obj.a + obj.b
}
/**
 * 类测试
 */
class Guang {
    name: string; // name 属性
    constructor(name: string) {
        this.name = name;
    }

    /**
     * 方法测试
     */
    sayHi(): string {
        return `hi, I'm ${this.name}`;
    }
}
