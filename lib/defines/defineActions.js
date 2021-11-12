/* 为模块定义实例和静态方法
 *
 */

function defineActions (Model, { actions, staticActions }) {
  // 定义 actions
  for (const [name, fn] of Object.entries(actions)) {
    if (name in Model.prototype) {
      throw new Error(`保留的实例方法：${name}`)
    }

    Model.prototype[name] = fn
  }

  // 定义 static actions
  for (const [name, fn] of Object.entries(staticActions)) {
    if (name in Model) {
      throw new Error(`保留的静态方法：${name}`)
    }

    Model[name] = fn
  }
}

module.exports = defineActions
