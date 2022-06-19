function func() {
    const num1 = 1;
    const num2 = 2;
    const num3 = /*@__PURE__*/add(1, 2);
    const num4 = add(3, 4);
    const num5 = 5;
    console.log(num2);
    return num2;
    console.log(num1);
    let a = 1
    function add(a, b) {
        return a + b;
    }
}
func();