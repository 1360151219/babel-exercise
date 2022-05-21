console.log("filename:line:1,column:0")
console.log(1);

function func() {
  console.log("filename:line:4,column:4")
  console.info(2);
}

export default class Clazz {
  say() {
    console.log("filename:line:9,column:8")
    console.debug(3);
  }

  render() {
    return <div>{[console.log("filename:line:12,column:21"), console.error(4)]}</div>;
  }

}