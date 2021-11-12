/* 根据 attributesDefinition 定义为 target 定义属性
 *
 */
const { isNil } = require('lodash')

function defineAttributes (target, attributesDefinition) {
  for (const [field, definition] of Object.entries(attributesDefinition)) {
    Object.defineProperty(target, field, {
      get () {
        return this._attributes[field]
      },
      set (value) {
        if ('type' in definition) {
          value = convertType(value, definition.type)
        }

        this._attributes[field] = value
      },
      enumerable: true,
      configurable: true
    })
  }
}

function convertType (value, type) {
  switch (type) {
    case String: return isNil(value) ? value : String(value)
    case Number: return isNil(value) ? value : Number(value)
    case Boolean: return isNil(value) ? value : Boolean(value)
    case Date: return isNil(value) ? value : new Date(value)
    case Array: return isNil(value) ? value : Array.from(value)
    case Object: return value
    default: return value
  }
}

module.exports = defineAttributes
