export default function stringToUpperCasePlugin() {
  console.log("In babel plugin!");

  return {
    name: 'babel-plugin-example',
    visitor: {
      StringLiteral(path) {
        const input = path.node.value;
        const output = input.toString().toUpperCase();
        console.log("Transforming string literal:", { input, output });

        path.node.value = output;
      }
    },
  };
}
