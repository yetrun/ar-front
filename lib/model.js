module.exports = {
  extend ({
    attributes: attributesDefinition,
    actions,
    staticActions,
    config
  } = {}) {
    // 调整选项
    attributesDefinition = attributesDefinition || {}
    actions = actions || {}
    staticActions = staticActions || {}
    config = config || {}
    
    // 这里声明私有变量
    _attributes = {}

    // 返回一个类
    return class {
      constructor (attributes = {}) {
        // 定义属性的 getter 和 setter
        for (const [field, attributeDefinition] of Object.entries(attributesDefinition)) {
          Object.defineProperty(this, field, {
            get () {
              return _attributes[field]
            },
            set (value) {
              _attributes[field] = value
            },
            enumerable: true
          })
        }

        this.attributes = attributes
      }

      get attributes () {
        if (config.dynamicAttributes) {
          const attributes = Object.keys(this).reduce((obj, key) => {
            if (!key.startsWith('_')) {
              obj[key] = this[key]
            }
            return obj
          }, {})
          return Object.assign({}, attributes, _attributes)
        } else {
          return Object.assign({}, _attributes)
        }
      }

      set attributes (attributes) {
        // 获得模型定义的默认属性对象
        const defaultAttributes = Object.keys(attributesDefinition).reduce((attrs, field) => {
          attrs[field] = null
          return attrs
        }, {})

        // 获得即将写入的属性对象
        let writingAttributes = null
        if (config.dynamicAttributes) {
          writingAttributes = Object.assign({}, defaultAttributes, attributes)
        } else {
          writingAttributes = Object.keys(defaultAttributes)
            .reduce((attrs, field) => {
              attrs[field] = attributes[field] || defaultAttributes[field]
              return attrs
            }, {})
        }

        // 找出需要删除的属性
        let deletingFields = []
        if (config.dynamicAttributes) {
          // 过滤掉以下划线开头的属性
          deletingFields = Object.keys(this).filter(field => !field.startsWith('_'))

          // 过滤掉即将写入的属性
          deletingFields = new Set(deletingFields)
          for (let field of Object.keys(writingAttributes)) {
            deletingFields.delete(field)
          }
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
    }
  }
}
