const { buildModelBase } = require('./defines')
const _extend = require('./extend')

function extend (options) {
  return _extend(this, options)
}

const Model = buildModelBase({
  dynamicAttributes: false,
  defineAttributesIn: 'prototype',
  setter (key, value) {
    this[key] = value
  },
  deleter (key) {
    delete this[key]
  }
})

Model.config = function (config) {
  config = Object.assign({}, this.defaultConfig, config)

  const baseModel = buildModelBase(config)
  baseModel.extend = extend

  return baseModel
}

Model.extend = extend

module.exports = Model
