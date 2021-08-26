module.exports = class Model {
  constructor (attributes = {}) {
    this._attributes = {}

    // 定义 getter 和 setter
    for (const attributeDefinition of this.constructor.attributes) {
      const field = attributeDefinition.field

      // TODO: 可否定义在原型上
      Object.defineProperty(this, field, {
        get () {
          return this._attributes[field]
        },
        set (value) {
          this._attributes[field] = value
        }
      })
    }

    this.attributes = attributes
  }

  get attributes () {
    if (this.constructor.dynamic) {
      const attributes = Object.keys(this).reduce((obj, key) => {
        if (!key.startsWith('_')) {
          obj[key] = this[key]
        }
        return obj
      }, {})
      return Object.assign({}, attributes, this._attributes)
    } else {
      return Object.assign({}, this._attributes)
    }
  }

  set attributes (attributes) {
    // 获得模型定义的默认属性对象
    const defaultAttributes = {} 
    this.constructor.attributes.map(attributeDefinition => defaultAttributes[attributeDefinition.field] = null)

    // 获得即将写入的属性对象
    let writingAttributes = null
    if (this.constructor.dynamic) {
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
    if (this.constructor.dynamic) {
      deletingFields = Object.keys(this).filter(field => !field.startsWith('_'))
      deletingFields = new Set(deletingFields)
      for (let field of Object.keys(writingAttributes)) {
        delete deletingFields[field]
      }
      deletingFields = [...deletingFields]
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
