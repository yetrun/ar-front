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
    },
    asyncFoo () {
      return new Promise(resolve => {
        setTimeout(() => resolve('foo'), 0)
      })
    }
  },
  methods: {
    bar () {
      return 'bar'
    }
  },
  static: {
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

test('define async action in prototype', async t => {
  const user = new User({ name: 'Jim', age: 18 })

  t.true('asyncFoo' in Object.getPrototypeOf(user))
  t.deepEqual(await user.asyncFoo(), 'foo')
})

test('define method in prototype', t => {
  const user = new User({ name: 'Jim', age: 18 })

  t.true('bar' in Object.getPrototypeOf(user))
  t.deepEqual(user.bar(), 'bar')
})

test('define static action in model class', t => {
  t.true('bar' in User)
  t.is(User.bar(), User)
})
