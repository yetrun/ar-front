const Transformer = require('./transformer')

const defaultOnTransform = function (downstreamRecord) {
  this.attributes = downstreamRecord.attributes
}

module.exports = function defineTransformer (Model, { 
  onTransform 
} = {
  onTransform: defaultOnTransform
}) {
  // 定义 derive 方法
  Object.defineProperty(Model.prototype, 'derive', {
    value () {
      const record = new Model(this.attributes)
      Object.defineProperty(record, '_transformer', {
        value: new Transformer(this, onTransform || defaultOnTransform),
        configurable: true
      })
      return record
    },
    configurable: true
  })

  // 定义 transform 方法
  Object.defineProperty(Model.prototype, 'transform', {
    value (attributes) {
      if (this._transformer) {
        this._transformer.transform(this)
      }
    },
    configurable: true
  })
}
