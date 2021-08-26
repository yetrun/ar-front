const test = require('ava')
const Model = require('../../lib/model')

// 定义 Model 类
class User extends Model {
  static attributes = [
    { field: 'name' },
    { field: 'age' }
  ]

  static dynamic = true
}

test('set attributes through constructor', t => {
  const user = new User({ name: 'Jim', foo: 'foo' })

  t.is(user.name, 'Jim')
  t.is(user.age, null)
  t.is(user.foo, 'foo')
})

test('set attributes through `attributes` property', t => {
  const user = new User({ age: 18, bar: 'bar' })
  user.attributes = { name: 'Jim', foo: 'foo' }

  t.is(user.name, 'Jim')
  t.is(user.age, null)
  t.is(user.foo, 'foo')
  t.false('bar' in user)
})

test('set attributes through dot operator', t => {
  const user = new User({ name: 'Jim' })
  user.name = 'Jim'
  user.foo = 'foo'

  t.deepEqual(user.attributes, { name: 'Jim', age: null, foo: 'foo' })
})
