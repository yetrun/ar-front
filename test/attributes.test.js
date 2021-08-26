/* 测试 `model.attributes` 的行为。
 *
 * 利用 `model.attributes`，可定制模型的行为，包括：
 *
 * - 定制 API 调用，如 `list`, `find` 等；
 * - 添加自定义函数或属性，如 `getFullName` 等。
 *
 */
const test = require('ava')
const Model = require('../lib/model')

// 定义 Model 类
class User extends Model {
  static attributes = [
    { field: 'name' },
    { field: 'age' }
  ]
}

test('set attributes through constructor', t => {
  const user = new User({ name: 'Jim', age: 18, foo: 'foo' })

  t.is(user.name, 'Jim')
  t.is(user.age, 18)
  t.is(user.foo, undefined)
})

test('set attributes through `attributes` property', t => {
  const user = new User()
  user.attributes = { name: 'Jim', age: 18, foo: 'foo' }

  t.is(user.name, 'Jim')
  t.is(user.age, 18)
  t.is(user.foo, undefined)
})

test('set attributes through dot operator', t => {
  const user = new User({ name: 'Jim', age: 18, foo: 'foo' })
  user.name = 'Jim'
  user.age = 18
  user.foo = 'foo'

  t.deepEqual(user.attributes, { name: 'Jim', age: 18 })
})
