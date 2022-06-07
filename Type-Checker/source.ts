
function addType<T>(a: T, b: T) {
    return a + b;
}

type Res<Param> = Param extends 1 ? number : string;
addType<Res<1>>(1, '2');

