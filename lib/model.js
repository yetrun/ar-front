const { merge } = require('lodash')

function convertType (value, type) {
  switch (type) {
    case String: return String(value)
    case Number: return Number(value)
    case Boolean: return Boolean(value)
    case Date: return new Date(value)
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
      enumerable: true
    })
  }
}

function defineComputedAttributes (target, attributesDefinition) {
  for (const [name, definition] of Object.entries(attributesDefinition)) {
    Object.defineProperty(target, name, definition)
  }
}

function defineConstructorAndAttributes ({ defineAttributesIn, attributesDefinition, computedAttributesDefinition }) {
  let Model = null
  if (defineAttributesIn === 'prototype') {
    Model = class {
      constructor (attributes = {}) {
        Object.defineProperty(this, '_attributes', {
          value: {},
          enumerable: false
        })

        this.attributes = attributes
      }
    }

    defineAttributes(Model.prototype, attributesDefinition)
    defineComputedAttributes(Model.prototype, computedAttributesDefinition)
  } else {
    Model = class {
      constructor (attributes = {}) {
        Object.defineProperty(this, '_attributes', {
          value: {},
          enumerable: false
        })

        defineAttributes(this, attributesDefinition)
        defineComputedAttributes(this, computedAttributesDefinition)
        this.attributes = attributes
      }
    }
  }

  return Model
}

function defineAttributesSetterAndGetter (Model, { dynamicAttributes, attributesDefinition }) {
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
        attrs[field] = 'default' in definition ? definition['default'].call(this) : null
        return attrs
      }, {})

      // 获得即将写入的属性对象
      const writingAttributes = dynamicAttributes
        ? Object.assign({}, defaultAttributes, attributes)
        : Object.keys(defaultAttributes)
          .reduce((attrs, field) => {
            attrs[field] = attributes[field] || defaultAttributes[field]
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
        this[key] = value
      }

      // 删除属性
      for (const key of deletingFields) {
        delete this[key]
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

const defaultOptions = {
  attributes: {},
  computedAttributes: {},
  actions: {},
  staticActions: {},
  config: {
    dynamicAttributes: false,
    defineAttributesIn: 'object'
  }
}

module.exports = {
  extend (options = {}) {
    // 调整选项
    options = merge({}, defaultOptions, options)
    const {
      attributes: attributesDefinition,
      computedAttributes: computedAttributesDefinition,
      actions,
      staticActions,
      config: {
        dynamicAttributes,
        defineAttributesIn
      }
    } = options

    // 定义类的构造函数、属性和计算属性
    const Model = defineConstructorAndAttributes({ defineAttributesIn, attributesDefinition, computedAttributesDefinition })

    // 定义 .attributes 方法的 setter 和 getter
    defineAttributesSetterAndGetter(Model, { dynamicAttributes, attributesDefinition })

    // 定义 actions
    defineActions(Model, { actions, staticActions })

    return Model
  }
}
