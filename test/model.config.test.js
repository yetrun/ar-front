/* 测试 Model.config 方法
 *
 */

const test = require('ava')
const Model = require('../lib/model')

test('Model.defaultConfig', t => {
  t.like(Model.defaultConfig, {
    dynamicAttributes: false,
    defineAttributesIn: 'prototype'
  })
})

test('Model.config return a new ModelFactory with different defaultConfig', t => {
  const modelFactory = Model.config({
    dynamicAttributes: true
  })

  t.like(modelFactory.defaultConfig, {
    dynamicAttributes: true,
    defineAttributesIn: 'prototype'
  })
})

test('Model.defaultConfig works on new model class', t => {
  const modelFactory = Model.config({
    dynamicAttributes: true
  })
  const modelClass = modelFactory.extend()

  // dynamicAttributes works
  const model = new modelClass({ a: 1, b: 2 })
  t.is(model.a, 1)
})

test('Model.extend override Model.config', t => {
  const modelFactory = Model.config({
    dynamicAttributes: true,
    defineAttributesIn: 'prototype'
  })
  const modelClass = modelFactory.extend({
    attributes: {
      a: {}, b: {}
    },
    config: {
      defineAttributesIn: 'object'
    }
  })

  const model = new modelClass({ a: 1, b: 2, c: 3 })
  // dynamicAttributes works
  t.is(model.c, 3)
  // defineAttributesIn: 'object'
  t.deepEqual(Object.keys(model), ['a', 'b', 'c'])
})
