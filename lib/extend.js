/* 使用类似于 Vue 的 extend 语法新建一个模型类
 *
 */
const { zipObject, isPlainObject } = require('lodash')
const { 
  buildModelBase,
  defineAttributes, 
  defineComputed: defineComputedAttributes, 
  defineActions 
} = require('./defines')

function prepareOptions(options, { defaultConfig }) {
  // 整理 attributes、computed、actions、static 部分
  const mixins = options.mixin || []
  if (!mixins.every(isPlainObject)) {
    throw new Error('mixins 选项不正确，应该传递一个对象数组')
  }

  const parts = ['attributes', 'computed', 'actions', 'static']
  const partDefinitions = parts.map(
    part => Object.assign(
      {}, 
      ...mixins.map(m => m[part] || {}),
      options[part] || {}
    )
  )
  const baseParts = zipObject(parts, partDefinitions)

  // 整理 config 部分
  const configPart = Object.assign({}, defaultConfig, options.config || {})

  return {
    name: options.name || '', // 整理 modelName
    config: configPart,
    ...baseParts
  }
}

function extend (modelBase, options = {}) {
  // 调整选项
  options = prepareOptions(options, { defaultConfig: modelBase.defaultConfig })
  const {
    name: modelName,
    attributes: attributesDefinition,
    computed: computedAttributesDefinition,
    actions,
    static: staticActions,
    config: {
      dynamicAttributes,
      defineAttributesIn,
      setter,
      deleter
    }
  } = options

  // 定义类的构造函数
  const modelClass = buildModelBase({ dynamicAttributes, defineAttributesIn, attributesDefinition, computedAttributesDefinition, setter, deleter })

  // 定义类的属性、计算属性
  if (defineAttributesIn === 'prototype') {
    defineAttributes(modelClass.prototype, attributesDefinition)
    defineComputedAttributes(modelClass.prototype, computedAttributesDefinition)
  }

  // 设置 modelClass Name
  Object.defineProperty(modelClass, 'name', {
    value: modelName
  })

  // 定义 actions
  defineActions(modelClass, { actions, staticActions })

  return modelClass
}

module.exports = extend
