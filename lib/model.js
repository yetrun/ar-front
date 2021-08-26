module.exports = class Model {
  constructor (attributes = {}) {
    // 提取参数 attributes 中适配静态属性 attributes 的键和值
    this.attributes = {}

    for (const attribute of this.constructor.attributes) {
      const field = attribute.field
      this.attributes[field] = attributes[field]
      Object.defineProperty(this, field, {
        get () {
          return this.attributes[field]
        },
        set (value) {
          this.attributes[field] = value
        }
      })
    }
  }
}
