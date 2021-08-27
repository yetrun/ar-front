function defineAttributes (target, attributesDefinition) {
  for (const [field, attributeDefinition] of Object.entries(attributesDefinition)) {
    Object.defineProperty(target, field, {
      get () {
        return this._attributes[field]
      },
      set (value) {
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

module.exports = {
  extend ({
    attributes: attributesDefinition,
    computedAttributes: computedAttributesDefinition,
    actions,
    staticActions,
    config
  } = {}) {
    // 调整选项
    attributesDefinition = attributesDefinition || {}
    computedAttributesDefinition = computedAttributesDefinition || {}
    actions = actions || {}
    staticActions = staticActions || {}
    let { dynamicAttributes, defineAttributesIn } = config || {}
    defineAttributesIn = defineAttributesIn || 'prototype'

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

    if (dynamicAttributes) {
      Object.defineProperty(Model.prototype, 'attributes', {
        get () {
          const attributes = Object.keys(this).reduce((obj, key) => {
            if (!key.startsWith('_')) {
              obj[key] = this[key]
            }
            return obj
          }, {})
          return Object.assign({}, attributes, this._attributes)
        },
        set (attributes) {
          // 获得模型定义的默认属性对象
          const defaultAttributes = Object.keys(attributesDefinition).reduce((attrs, field) => {
            attrs[field] = null
            return attrs
          }, {})

          // 获得即将写入的属性对象
          const writingAttributes = Object.assign({}, defaultAttributes, attributes)

          // 找出需要删除的属性
          // 过滤掉以下划线开头的属性
          deletingFields = Object.keys(this)
          deletingFields = deletingFields.filter(field => !field.startsWith('_'))
          // 过滤掉即将写入的属性
          deletingFields = new Set(deletingFields)
          for (let field of Object.keys(writingAttributes)) {
            deletingFields.delete(field)
          }
          deletingFields = Array.from(deletingFields)

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
    } else {
      Object.defineProperty(Model.prototype, 'attributes', {
        get () {
          return Object.assign({}, this._attributes)
        },
        set (attributes) {
          // 获得模型定义的默认属性对象
          const defaultAttributes = Object.keys(attributesDefinition).reduce((attrs, field) => {
            attrs[field] = null
            return attrs
          }, {})

          // 获得即将写入的属性对象
          const writingAttributes = Object.keys(defaultAttributes)
            .reduce((attrs, field) => {
              attrs[field] = attributes[field] || defaultAttributes[field]
              return attrs
            }, {})

          // 找出需要删除的属性
          let deletingFields = []

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

    return Model
  }
}
