const test = require('ava')
const Model = require('../lib/model')

test('mixin add an attribute definition', t => {
  const User = Model.extend({
    attributes: {
      name: { type: String }
    },
    mixin: [
      {
        attributes: {
          age: { type: Number }
        }
      }
    ]
  })

  const user = new User({ name: 'Jim', age: 18 })
  t.is(user.name, 'Jim')
  t.is(user.age, 18)
})

test('mixin ignore an exist attribute definition', t => {
  const User = Model.extend({
    attributes: {
      name: { type: String }
    },
    mixin: [
      {
        attributes: {
          name: { type: String, default: 18 }
        }
      }
    ]
  })

  const user = new User()
  t.is(user.name, null) // default not work
})

test('mixin adds an part', t => {
  const User = Model.extend({
    attributes: {
      name: { type: String }
    },
    mixin: [
      {
        computed: {
          capitalized: {
            get () {
              return this.name[0].toUpperCase() + this.name.substr(1)
            }
          }
        }
      }
    ]
  })

  const user = new User({ name: 'jim' })
  t.is(user.capitalized, 'Jim')
})

test('mixin ignore unknown part', t => {
  t.notThrows(() => {
    Model.extend({
      attributes: {
        name: { type: String }
      },
      mixin: [
        {
          unknown: {
            foo: 'foo',
            bar: 'bar'
          }
        }
      ]
    })
  })
})

test('following mixin overloads previous one', t => {
  const User = Model.extend({
    mixin: [
      {
        attributes: {
          name: { type: String},
          age: { type: String }
        }
      },
      {
        attributes: {
          age: { type: Number }
        }
      }
    ]
  })

  const user = new User({ name: 'Jim', age: '18' })
  t.is(user.name, 'Jim') // name preserved
  t.is(user.age, 18) // type converted
})
