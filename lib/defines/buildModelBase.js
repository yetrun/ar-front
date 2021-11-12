/* 根据配置建立一个 Model 基类
 *
 */
const { isFunction } = require('lodash')
const defineAttributes = require('./defineAttributes')

function buildModelBase ({ 
  dynamicAttributes, 
  defineAttributesIn, 
  setter, 
  deleter, 
  attributesDefinition, 
}) {
  const Model = class Model {
    constructor (attributes = {}) {
      Object.defineProperty(this, '_attributes', {
        value: {},
      })

      Object.defineProperty(this, '$model', {
        value: Model
      })

      if (!this.constructor.definedAttributes) {
        // 如果尚未定义 definedAttributes，调用模型类的静态方法调用
        this.constructor.defineAttributes && this.constructor.defineAttributes()
      }

      if (defineAttributesIn === 'object') {
        defineAttributes(this, attributesDefinition || this.constructor.definedAttributes)
        // 计算属性还是考虑定义在原型
        // defineComputedAttributes(this, computedAttributesDefinition)
      }

      this.attributes = attributes
    }

    get attributes () {
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
    }

    set attributes (attributes) {
      attributesDefinition = attributesDefinition || this.constructor.definedAttributes

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

    static defineAttribute (name, options) {
      defineAttributes(this, { [name]: options })

      this.definedAttributes = this.definedAttributes || {}
      Object.assign(this.definedAttributes, { [name]: options })
    }
  }

  Model.defaultConfig = {
    dynamicAttributes, 
    defineAttributesIn, 
    setter, 
    deleter, 
    // attributesDefinition
  }

  return Model
}

module.exports = buildModelBase
