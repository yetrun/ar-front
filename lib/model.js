const { zipObject, merge, isPlainObject, isNil, isFunction } = require('lodash')
const defineTransformer = require('./defineTransformer')

function convertType (value, type) {
  switch (type) {
    case String: return isNil(value) ? value : String(value)
    case Number: return isNil(value) ? value : Number(value)
    case Boolean: return isNil(value) ? value : Boolean(value)
    case Date: return isNil(value) ? value : new Date(value)
    case Array: return isNil(value) ? value : Array.from(value)
    case Object: return value
    default: return value
  }
}

function defineAttributes (target, attributesDefinition) {
  for (const [field, definition] of Object.entries(attributesDefinition)) {
    Object.defineProperty(target, field, {
      get () {
        return this._attributes[field]
      },
      set (value) {
        if ('type' in definition) {
          value = convertType(value, definition.type)
        }

        this._attributes[field] = value
      },
      enumerable: true,
      configurable: true
    })
  }
}

function defineComputedAttributes (target, attributesDefinition) {
  for (const [name, definition] of Object.entries(attributesDefinition)) {
    Object.defineProperty(target, name, definition)
  }
}

function defineConstructorAndAttributes ({ defineAttributesIn, attributesDefinition, computedAttributesDefinition }) {
  const Model = class {
    constructor (attributes = {}, _transformer) {
      Object.defineProperty(this, '_attributes', {
        value: {},
      })

      Object.defineProperty(this, '$model', {
        value: Model
      })

      if (defineAttributesIn === 'object') {
        defineAttributes(this, attributesDefinition)
        defineComputedAttributes(this, computedAttributesDefinition)
      }

      this.attributes = attributes
    }
  }

  if (defineAttributesIn === 'prototype') {
    defineAttributes(Model.prototype, attributesDefinition)
    defineComputedAttributes(Model.prototype, computedAttributesDefinition)
  }

  return Model
}

function defineAttributesSetterAndGetter (Model, { 
  dynamicAttributes, 
  attributesDefinition,
  setter,
  deleter
}) {
  Object.defineProperty(Model.prototype, 'attributes', {
    get () {
      if (dynamicAttributes) {
        const allOwnAttributes = Object.keys(this).reduce((obj, key) => {
          if (!key.startsWith('_')) {
            obj[key] = this[key]
          }
          return obj
        }, {})
        return Object.assign({}, allOwnAttributes, this._attributes)
      } else {
        return Object.assign({}, this._attributes)
      }
    },
    set (attributes) {
      // 获得模型定义的默认属性对象
      const defaultAttributes = Object.entries(attributesDefinition).reduce((attrs, [field, definition]) => {
        let value = null
        if ('default' in definition) {
          value = isFunction(definition['default']) ? definition['default'].call(this) : definition['default']
        }
        attrs[field] = value
        return attrs
      }, {})

      // 获得即将写入的属性对象，此间合并了默认值
      const writingAttributes = dynamicAttributes
        ? Object.assign({}, defaultAttributes, attributes)
        : Object.keys(defaultAttributes)
          .reduce((attrs, field) => {
            // 当且仅当 field 不在 attributes 中才适用默认值
            attrs[field] = field in attributes ? attributes[field] : defaultAttributes[field]
            return attrs
          }, {})

      // 找出需要删除的属性
      let deletingFields = []
      if (dynamicAttributes) {
        // 准备好所有自身的属性
        deletingFields = Object.keys(this)
        deletingFields = deletingFields.filter(field => !field.startsWith('_'))

        // 过滤掉即将写入的属性
        deletingFields = new Set(deletingFields)
        for (const key of Object.keys(writingAttributes)) {
          deletingFields.delete(key)
        }

        // 重新转化为数组
        deletingFields = Array.from(deletingFields)
      }

      // 写入属性
      for (const [key, value] of Object.entries(writingAttributes)) {
        setter.call(this, key, value)
      }

      // 删除属性
      for (const key of deletingFields) {
        deleter.call(this, key)
      }
    }
  })
}

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

function prepareOptions(options) {
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
  const configPart = Object.assign({}, this.defaultConfig, options.config || {})

  // onTransform 是个函数，单独提取
  const onTransform = options.onTransform

  return {
    name: options.name || '', // 整理 modelName
    config: configPart,
    ...baseParts,
    onTransform
  }
}

class ModelFactory {
  constructor (defaultConfig) {
    this.defaultConfig = defaultConfig
  }

  extend (options = {}) {
    // 调整选项
    options = prepareOptions.call(this, options)
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
      },
      onTransform
    } = options

    // 定义类的构造函数、属性和计算属性
    const modelClass = defineConstructorAndAttributes({ defineAttributesIn, attributesDefinition, computedAttributesDefinition })

    // 设置 modelClass Name
    Object.defineProperty(modelClass, 'name', {
      value: modelName
    })

    // 定义 .attributes 方法的 setter 和 getter
    defineAttributesSetterAndGetter(modelClass, { dynamicAttributes, attributesDefinition, setter, deleter })

    // 定义 actions
    defineActions(modelClass, { actions, staticActions })

    // 定义 Transformer 相关的选项
    defineTransformer(modelClass, { onTransform })

    return modelClass
  }

  config (config) {
    const defaultConfig = merge({}, this.defaultConfig, config)

    return new ModelFactory(defaultConfig)
  }
}

module.exports = new ModelFactory({
  dynamicAttributes: false,
  defineAttributesIn: 'prototype',
  setter (key, value) {
    this[key] = value
  },
  deleter (key) {
    delete this[key]
  }
})
