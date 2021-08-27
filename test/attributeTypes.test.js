const test = require('ava')
const Model = require('../lib/model')

const User = Model.extend({
  attributes: {
    name: { type: String },
    age: { type: Number }
  }
})

test('string is not number', t => {
  t.not('18', 18)
})

test('convert types in constructor', t => {
  const user = new User({ name: 'Jim', age: '18' })

  t.is(user.name, 'Jim')
  t.is(user.age, 18)
})

test('convert types in .attributes method', t => {
  const user = new User()
  user.attributes = { name: 'Jim', age: '18' }

  t.is(user.name, 'Jim')
  t.is(user.age, 18)
})

test('convert types in setter', t => {
  const user = new User()
  user.name = 'Jim'
  user.age = '18'

  t.is(user.name, 'Jim')
  t.is(user.age, 18)
})
