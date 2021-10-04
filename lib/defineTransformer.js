const defaultOnTransform = function (attributes) {
  this.attributes = attributes
}

class Transformer {
  constructor (record, onTransform) {
    this._record = record
    this._onTransform = onTransform
  }

  transform (attributes) {
    if (this._onTransform) {
      this._onTransform.call(this._record, attributes)
    }
  }
}

module.exports = function defineTransformer (Model, { 
  onTransform 
} = {
  onTransform: defaultOnTransform
}) {
  // 定义 fork 方法
  Object.defineProperty(Model.prototype, 'fork', {
    value () {
      const record = new Model(this.attributes)
      Object.defineProperty(record, '_transformer', {
        value: new Transformer(this, onTransform || defaultOnTransform)
      })
      return record
    }
  })

  // 定义 transform 方法
  Object.defineProperty(Model.prototype, 'transform', {
    value (attributes) {
      if (this._transformer) {
        this._transformer.transform(attributes || this.attributes)
      }
    }
  })
}
