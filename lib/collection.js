// 定义一个集合类，它的元素是 Record
// 集合类首先是一个简易数组，其拥有索引方法、 push 方法等原装数组的方法
// 集合类然后拥有一个 transformer，其拥有 _transformer 属性和 onTransform 方法

const { merge } = require('lodash')
const { Transformer } = require('./transform')

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

const globalDefaultOptions = {
  onTransform (downstreamRecord) {
    if (downstreamRecord.destroyed) {
      const index = this.findIndex(record => record.id === downstreamRecord.id)
      this.splice(index, 1)
    } else {
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

    return class Collection {
      constructor (items) {
        Object.defineProperty(this, '_elems', {
          value: []
        })

        // 将 items 关联到自身
        for (const item of items) {
          this.push(this.new(item))
        }
      }

      findIndex (...params) {
        return this._elems.findIndex(...params)
      }

      push (record) {
        defineIndex(this, this.length)

        this._elems.push(record)
      }

      splice (start, deleteCount, ...items) {
        const addedCount = items.length - deleteCount
        if (addedCount > 0) {
          for (let i = 0; i < addedCount; i++) {
            defineIndex(this, i + this.length)
          }
        } else if (addedCount < 0) {
          for (let i = -1; i >= addedCount; i--) {
            deleter.call(this, this.length + i)
          }
        }

        this._elems.splice(start, deleteCount, ...items)
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
          value: new Transformer(this, onTransform)
        })
        return record
      }
    }
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
