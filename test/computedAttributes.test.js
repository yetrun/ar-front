const test = require('ava')
const Model = require('../lib/model')

const User = Model.extend({
  attributes: {
    firstName: {},
    lastName: {}
  },
  computed: {
    fullName: {
      get () {
        return this.firstName + ' ' + this.lastName
      },
      set (fullName) {
        const [firstName, lastName] = fullName.split(' ')
        this.firstName = firstName
        this.lastName = lastName
      }
    }
  }
})

test('get fullName', t => {
  const user = new User({ firstName: 'James', lastName: 'Dean' })

  t.is(user.fullName, 'James Dean')
})

test('define static action in model class', t => {
  const user = new User()
  user.fullName = 'James Dean'

  t.is(user.firstName, 'James')
  t.is(user.lastName, 'Dean')
})
