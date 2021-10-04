const test = require('ava')
const Model = require('../lib/model')

test('fork', t => {
  const User = Model.extend({
    attributes: { name: {}, age: {} }
  })

  const user = new User({ name: 'Jim', age: 18 })
  const user2 = user.fork()

  t.deepEqual(user2.attributes, { name: 'Jim', age: 18 })
})

test('transform attributes', t => {
  const User = Model.extend({
    attributes: { name: {}, age: {} }
  })

  const user = new User({ name: 'Jim', age: 18 })
  const user2 = user.fork()

  user2.transform({ name: 'James', age: 19 })
  t.deepEqual(user.attributes, { name: 'James', age: 19 })
})

test('model default transforms its own attributes', t => {
  const User = Model.extend({ 
    attributes: { name: {}, age: {} },
  })

  const user = new User({ name: 'Jim', age: 18 })
  const user2 = user.fork()
  user2.attributes = { name: 'James', age: 19 }

  user2.transform()
  t.deepEqual(user.attributes, { name: 'James', age: 19 })
})

test('customize onTransform', t => {
  const User = Model.extend({
    attributes: { name: {}, age: {} },
    onTransform (attributes) {
      this.attributes2 = attributes
    }
  })

  const user = new User({ name: 'Jim', age: 18 })
  const user2 = user.fork()

  user2.transform({ name: 'James', age: 19 })
  t.deepEqual(user.attributes, { name: 'Jim', age: 18 })
  t.deepEqual(user.attributes2, { name: 'James', age: 19 })
})

test('调用 transform 方法对新建的 record 没有影响', t => {
  const User = Model.extend({
    attributes: { name: {}, age: {} },
    onTransform (attributes) {
      this.attributes = attributes
    }
  })

  const user = new User({ name: 'Jim', age: 18 })
  user.transform()

  t.pass()
})
