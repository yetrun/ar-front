const test = require('ava')
const Model = require('../lib/model')

const User = Model.extend({
  attributes: {
    name: {},
    age: {}
  },
  actions: {
    foo () {
      return this.attributes
    }
  },
  staticActions: {
    bar () {
      return this
    }
  }
})

test('define action in prototype', t => {
  const user = new User({ name: 'Jim', age: 18 })

  t.true('foo' in Object.getPrototypeOf(user))
  t.deepEqual(user.foo(), user.attributes)
})

test('define static action in model class', t => {
  t.true('bar' in User)
  t.is(User.bar(), User)
})
