// 定义一个集合类，它的元素是 Record
// 集合类首先是一个简易数组，其拥有索引方法、 push 方法等原装数组的方法
// 集合类然后拥有一个 transformer，其拥有 _transformer 属性和 onTransform 方法

const { merge } = require('lodash')
const { Transformer } = require('./transform')

const appliedArrayMethods = [
  'concat',
  'copyWithin',
  'entries',
  'every',
  'fill',
  'filter',
  'find',
  'findIndex',
  'flat',
  'flatMap',
  'forEach',
  'includes',
  'indexOf',
  'join',
  'keys',
  'lastIndexOf',
  'map',
  'pop',
  'pop',
  'push',
  'reduce',
  'reduceRight',
  'reverse',
  'shift',
  'slice',
  'some',
  'sort',
  'splice',
  'toLocaleString',
  'toString',
  'unshift',
  'values'
]

function defineIndex(collection, index) {
  Object.defineProperty(collection, index, {
    get () {
      return this._elems[index]
    },
    set (value) {
      this._elems[index] = value
    },
    configurable: true,
    enumerable: true
  })
}

function applyArrayPrototype (Collection, deleter) {
  for (const name of appliedArrayMethods) {
    if (!Collection.prototype[name]) {
      Collection.prototype[name] = function (...params) {
        const previousLength = this.length

        // 首先应用到 this._elems
        const result = Array.prototype[name].apply(this._elems, params)

        // 然后调整 Object.defineProperty
        if (this.length > previousLength) {
          for (let index = previousLength; index < this.length; index++) {
            defineIndex(this, index)
          }
        } else if (this.length < previousLength) {
          for (let index = previousLength - 1; index >= this.length; index--) {
            deleter.call(this, index)
          }
        }

        return result
      }
    }
  }
}

const globalDefaultOptions = {
  onTransform (downstreamRecord) {
    if (downstreamRecord.destroyed) {
      const index = this.findIndex(record => record.id === downstreamRecord.id)
      this.splice(index, 1)
    } else if(downstreamRecord.id && !this.some(record => record.id === downstreamRecord.id)) {
      this.push(downstreamRecord)
    }
  }
}

class CollectionFactory {
  constructor (defaultConfig = {}) {
    this.defaultConfig = defaultConfig
  }

  extend (options = {}) {
    const {
      model,
      onTransform,
      config: {
        deleter
      }
    } = merge({}, globalDefaultOptions, { config: this.defaultConfig }, options)

    const collectionClass = class Collection {
      constructor (items = []) {
        Object.defineProperty(this, '_elems', {
          value: [],
          configurable: true
        })

        // 将 items 关联到自身
        for (const item of items) {
          this.push(this.new(item))
        }
      }

      get length () {
        return this._elems.length
      }

      get $model () {
        return model
      }

      new (attributes) {
        const record = new this.$model(attributes)
        Object.defineProperty(record, '_transformer', {
          value: new Transformer(this, onTransform),
          configurable: true
        })
        return record
      }
    }

    applyArrayPrototype(collectionClass, deleter)

    return collectionClass
  }

  config (config) {
    const defaultConfig = merge({}, this.defaultConfig, config)
    return new CollectionFactory(defaultConfig)
  }
}

module.exports = new CollectionFactory({
  deleter (index) {
    delete this[index]
  }
})
