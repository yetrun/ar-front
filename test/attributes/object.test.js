/* config:
 * - defineAttributesIn: 'object'
 * - dynamicAttributes: false
 *
 */
const test = require('ava')
const Model = require('../../lib/model')

const User = Model.extend({
  attributes: {
    name: {},
    age: {}
  },
  config: {
    defineAttributesIn: 'object'
  }
})

test('set attributes through constructor', t => {
  const user = new User({ name: 'Jim', foo: 'foo' })

  t.is(user.name, 'Jim')
  t.is(user.age, null)
  t.false('foo' in user)

  t.deepEqual(Object.keys(user), ['name', 'age'])
  t.deepEqual(Object.keys(Object.getPrototypeOf(user)), [])
})

test('set attributes through `attributes` property', t => {
  const user = new User({ age: 18 })
  user.attributes = { name: 'Jim', foo: 'foo' }

  t.is(user.name, 'Jim')
  t.is(user.age, null)
  t.false('foo' in user)

  t.deepEqual(Object.keys(user), ['name', 'age'])
  t.deepEqual(Object.keys(Object.getPrototypeOf(user)), [])
})

test('set attributes through dot operator', t => {
  const user = new User({ age: 18 })
  user.name = 'Jim'
  user.foo = 'foo'

  t.deepEqual(user.attributes, { name: 'Jim', age: 18 })

  t.deepEqual(Object.keys(user), ['name', 'age', 'foo'])
  t.deepEqual(Object.keys(Object.getPrototypeOf(user)), [])
})
