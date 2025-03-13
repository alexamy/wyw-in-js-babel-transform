export default function stringToUpperCasePlugin() {
  console.log("In babel plugin!");

  return {
    name: 'babel-plugin-example',
    visitor: {
      StringLiteral(path) {
        path.node.value = path.node.value.toString().toUpperCase()
      }
    },
  };
}
