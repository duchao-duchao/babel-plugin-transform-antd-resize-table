"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

module.exports = function (_ref) {
  var babelTypes = _ref.types;

  return {
    // 对import转码
    visitor: {
      "ImportDeclaration|VariableDeclaration": function ImportDeclarationVariableDeclaration(path, state) {
        var TARGET_PKG_NAME = "custom-antd-resize-table";
        //排除自定义Table组件的import
        if (state.file.opts.filename && state.file.opts.filename.includes("resize-table")) {
          return;
        }
        //resize-table已经import引入,直接return
        if (path.isImportDeclaration() && path.get("source").isStringLiteral() && path.get("source").node.value === TARGET_PKG_NAME) {
          return;
        }

        //判断有没有引入antd的Table
        if (path.isImportDeclaration() && path.get("source").node.value === "antd" && path.node.specifiers.find(function (item) {
          return item.imported.name === "Table";
        })) {
          //删除antd原本的table引用
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = Object.entries(path.scope.bindings)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var _step$value = _slicedToArray(_step.value, 2),
                  name = _step$value[0],
                  binding = _step$value[1];

              if (binding.kind === "module") {
                if (binding.identifier.name === "Table") {
                  binding.path.remove();
                }
              }
            }

            //创建新的import 引入自己的Table
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          var importDefaultSpecifier = [babelTypes.ImportDefaultSpecifier(babelTypes.Identifier("Table"))];
          var importDeclaration = babelTypes.ImportDeclaration(importDefaultSpecifier, babelTypes.StringLiteral(TARGET_PKG_NAME));
          path.insertBefore(importDeclaration);
        }
      }
    }
  };
};