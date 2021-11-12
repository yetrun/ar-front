/* 为模型定义属性，同时为模型类设置 definedAttributes 配置
 *
 */
const { defineAttributes: defineAttributesIntoTarget } = require('./defines')

module.exports = function defineAttributes (modelClass, attributesDefinition) {
  defineAttributesIntoTarget(modelClass.prototype, attributesDefinition)
  modelClass.definedAttributes = attributesDefinition
}
