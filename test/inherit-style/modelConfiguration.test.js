/* 配置 Model 后在测试继承效果
 *
 */

const test = require('ava')
const ModelFactory = require('../../lib/model')
const defineAttributes = require('../../lib/defineAttributes')

const Model = ModelFactory.config({
  dynamicAttributes: true,
  defineAttributesIn: 'object',
})

class User extends Model {
  // 计算属性、实例方法、静态方法不用测试
}

// 为 User.prototype 定义两个属性
defineAttributes(User, {
  name: {},
  age: {}
})

test('测试动态属性', t => {
  const user = new User()
  user.attributes = { name: 'Jim', age: 18, foo: 'foo' }

  t.is(user.name, 'Jim')
  t.is(user.age, 18)
  t.is(user.foo, 'foo')
})

test('测试 extend 语法', t => {
  const User = Model.extend({
    attributes: {
      name: {}, age: {}
    }
  })

  const user = new User()
  user.attributes = {
    name: 'Jim',
    age: 18,
    foo: 'foo'
  }

  t.is(user.name, 'Jim')
  t.is(user.age, 18)
  t.is(user.foo, 'foo')
})
