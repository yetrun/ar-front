const test = require('ava')
const Model = require('../../lib/model')

class User extends Model {
  static defineAttributes () {
    this.attr('name', {})
    this.attr('age', {})
  }
}

test('测试 defineAttributes 成功设置了属性定义', t => {
  const user = new User()
  user.attributes = {
    name: 'Jim',
    age: 18,
    foo: 'foo'
  }

  t.is(user.name, 'Jim')
  t.is(user.age, 18)
  t.is(user.foo, undefined)
})
