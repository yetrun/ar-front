const test = require('ava')
const Model = require('../lib/model')
const Collection = require('../lib/collection')

const User = Model.extend({
  attributes: { name: {}, age: {} }
})

test('集合是一个简易数组', t => {
  const Users = Collection.extend({
    model: User
  })

  const users = new Users()
  users.push(new User({ name: 'Jim', age: 18 }))
  users.push(new User({ name: 'James', age: 19 }))
  users.push(new User({ name: 'Jane', age: 20 }))

  t.is(users.length, 3)
  t.deepEqual(users[0].attributes, { name: 'Jim', age: 18 })
  t.deepEqual(users[1].attributes, { name: 'James', age: 19 })
  t.deepEqual(users[2].attributes, { name: 'Jane', age: 20 })
})

test('自定义 onTransform', t => {
  const Users = Collection.extend({
    model: User,
    onTransform (downstreamRecord) {
      this.newRecord = downstreamRecord
    }
  })

  const users = new Users()
  const user = users.new()
  user.attributes = { name: 'Jane', age: 20 }

  user.transform()
  t.deepEqual(users.newRecord.attributes, { name: 'Jane', age: 20 })
})

test('集合默认的 transformer 效果', t => {
  const Users = Collection.extend({
    model: User
  })

  const users = new Users()
  users.push(new User({ name: 'Jim', age: 18 }))
  users.push(new User({ name: 'James', age: 19 }))

  const user = users.new()
  user.attributes = { name: 'Jane', age: 20 }
  user.transform()

  t.is(users.length, 3)
  t.deepEqual(users[2].attributes, { name: 'Jane', age: 20 })
})
