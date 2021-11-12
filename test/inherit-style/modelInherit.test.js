/* 测试继承 Model 基类的实现方法
 *
 */

const test = require('ava')
const Model = require('../../lib/model')
const defineAttributes = require('../../lib/defineAttributes')

class User extends Model {
  // 计算属性、实例方法、静态方法不用测试
}

// 为 User.prototype 定义两个属性
defineAttributes(User, {
  name: {},
  age: {}
})

test('测试构造方法', t => {
  const user = new User({ name: 'Jim', age: 18 })

  t.is(user.name, 'Jim')
  t.is(user.age, 18)
})

test('测试属性的设置和读取', t => {
  const user = new User()
  user.name = 'Jim'
  user.age = 18

  t.is(user.name, 'Jim')
  t.is(user.age, 18)
})

test('测试 attributes 方法', t => {
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
  t.is(user.foo, undefined)
})
