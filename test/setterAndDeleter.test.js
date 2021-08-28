const test = require('ava')
const Model = require('../lib/model')

let setterExecuted = ''
let deleterExecuted = ''

const User = Model.extend({
  config: {
    dynamicAttributes: true,
    setter (key, value) {
      setterExecuted = key
      this[key] = value
    },
    deleter (key) {
      deleterExecuted = key
      delete this[key]
    }
  }
})

test('setter and deleter', t => {
  const user = new User({ a: 1 })

  t.deepEqual(user.attributes, { a: 1 })
  t.is(setterExecuted, 'a')

  user.attributes = { b: 2 }
  t.deepEqual(user.attributes, { b: 2 })
  t.is(setterExecuted, 'b')
  t.is(deleterExecuted, 'a')
})
