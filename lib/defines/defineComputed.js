/* 根据 attributesDefinition 定义为 target 定义计算属性
 *
 */
function defineComputedAttributes (target, attributesDefinition) {
  for (const [name, { get, set }] of Object.entries(attributesDefinition)) {
    Object.defineProperty(target, name, { get, set })
  }
}

module.exports = defineComputedAttributes
