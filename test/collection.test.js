const test = require('ava')
const Model = require('../lib/model')
const Collection = require('../lib/collection')

const User = Model.extend({
  attributes: { name: {}, age: {} }
})

const Users = Collection.extend({
  model: User
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

test('集合拥有与数组一致的方法', t => {
  const Users = Collection.extend({
    model: User
  })

  const users = new Users()
  users.push(new User({ name: 'Jim', age: 18 }))
  users.push(new User({ name: 'James', age: 19 }))
  users.push(new User({ name: 'Jane', age: 20 }))

  users.shift() // 拿 shift 方法举例
  t.is(users.length, 2)
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
  const User = Model.extend({
    attributes: { id: {}, name: {}, age: {} }
  })
  const Users = Collection.extend({
    model: User
  })

  const users = new Users()
  users.push(new User({ id: 1, name: 'Jim', age: 18 }))
  users.push(new User({ id: 2, name: 'James', age: 19 }))

  const user = users.new()
  user.attributes = { id: 3, name: 'Jane', age: 20 }
  user.transform()

  t.is(users.length, 3)
  t.deepEqual(users[2].attributes, { id: 3, name: 'Jane', age: 20 })
})

test('克隆一个 Collection', t => {
  const users = new Users([
    { name: 'Jim', age: 18 },
    { name: 'Jack', age: 19 },
  ])
  const copiedUsers = users.clone()

  t.deepEqual(users[0].attributes, copiedUsers[0].attributes)
  t.deepEqual(users[1].attributes, copiedUsers[1].attributes)
  t.true(copiedUsers instanceof Users)
})

test('转化为纯粹的数组', t => {
  const users = new Users([
    { name: 'Jim', age: 18 },
    { name: 'Jack', age: 19 },
  ])
  const userArray = users.toArray()

  t.deepEqual(users[0].attributes, userArray[0].attributes)
  t.deepEqual(users[1].attributes, userArray[1].attributes)
  t.true(Array.isArray(userArray))
})
