module.exports = function ({ types: babelTypes }) {
  return {
    // 对import转码
    visitor: {
      "ImportDeclaration|VariableDeclaration"(path, state) {
        const { optionName } = state.opts;
        const TARGET_PKG_NAME = optionName || "custom-antd-resize-table";
        //排除自定义Table组件的import
        if (
          state.file.opts.filename &&
          state.file.opts.filename.includes(TARGET_PKG_NAME)
        ) {
          return;
        }
        //resize-table已经import引入,直接return
        if (
          path.isImportDeclaration() &&
          path.get("source").isStringLiteral() &&
          path.get("source").node.value === TARGET_PKG_NAME
        ) {
          return;
        }

        //判断有没有引入antd的Table
        if (
          path.isImportDeclaration() &&
          path.get("source").node.value === "antd" &&
          path.node.specifiers.find((item) => item.imported.name === "Table")
        ) {
          //删除antd原本的table引用
          for (const [name, binding] of Object.entries(path.scope.bindings)) {
            if (binding.kind === "module") {
              if (binding.identifier.name === "Table") {
                binding.path.remove();
              }
            }
          }

          //创建新的import 引入自己的Table
          const importDefaultSpecifier = [
            babelTypes.ImportDefaultSpecifier(babelTypes.Identifier("Table")),
          ];
          const importDeclaration = babelTypes.ImportDeclaration(
            importDefaultSpecifier,
            babelTypes.StringLiteral(TARGET_PKG_NAME)
          );
          path.insertBefore(importDeclaration);
        }
      },
    },
  };
};
