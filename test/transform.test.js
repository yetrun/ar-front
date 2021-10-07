const test = require('ava')
const Model = require('../lib/model')

test('derive', t => {
  const User = Model.extend({
    attributes: { name: {}, age: {} }
  })

  const user = new User({ name: 'Jim', age: 18 })
  const user2 = user.derive()

  t.deepEqual(user2.attributes, { name: 'Jim', age: 18 })
})

test('默认情况下，transform 方法会将属性传递给上游', t => {
  const User = Model.extend({ 
    attributes: { name: {}, age: {} },
  })

  const user = new User({ name: 'Jim', age: 18 })
  const user2 = user.derive()
  user2.attributes = { name: 'James', age: 19 }

  user2.transform()
  t.deepEqual(user.attributes, { name: 'James', age: 19 })
})

test('自定义 onTransform', t => {
  const User = Model.extend({
    attributes: { name: {}, age: {} },
    onTransform (downstreamRecord) {
      this.attributes2 = downstreamRecord.attributes
    }
  })

  const user = new User({ name: 'Jim', age: 18 })
  const user2 = user.derive()
  user2.attributes = { name: 'James', age: 19 }

  user2.transform()
  t.deepEqual(user.attributes, { name: 'Jim', age: 18 })
  t.deepEqual(user.attributes2, { name: 'James', age: 19 })
})

test('action 会默认调用 transform', t => {
  const User = Model.extend({
    attributes: { name: {}, age: {} },
    actions: {
      save () {}
    }
  })

  const user = new User({ name: 'Jim', age: 18 })
  const user2 = user.derive()

  user2.attributes = { name: 'James', age: 19 }
  user2.save()
  t.deepEqual(user.attributes, { name: 'James', age: 19 })
})

test('调用 transform 方法对没有连接的 record 没有影响', t => {
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
