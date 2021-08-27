const test = require('ava')
const Model = require('../lib/model')

const User = Model.extend({
  attributes: {
    name: { default () { return 'Jim' } },
    age: { default () { return 18 } }
  }
})

test('default works in constructor', t => {
  const user = new User({ name: 'Jam' })

  t.is(user.name, 'Jam')
  t.is(user.age, 18)
})

test('default works in set attributes method', t => {
  const user = new User({ name: 'Jam' })
  user.attributes = { age: 20 }

  t.is(user.name, 'Jim')
  t.is(user.age, 20)
})
