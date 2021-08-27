const test = require('ava')
const Model = require('../lib/model')

const User = Model.extend({
  name: 'User'
})

test('get model name', t => {
  t.is(User.modelName, 'User')
})

test('get model class', t => {
  const user = new User()

  t.is(user.constructor, User)
  t.is(user.$model, User)
})
