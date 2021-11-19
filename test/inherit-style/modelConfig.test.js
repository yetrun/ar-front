/* 重新定义 Model 的配置
 *
 */

const test = require('ava')
const Model = require('../../lib/model')
const defineAttributes = require('../../lib/defineAttributes')

class User extends Model {
  static defaultConfig = {
    dynamicAttributes: true,
    defineAttributesIn: 'object',
    // 未定义 setter 和 deleter，因为有默认定义
  }

  static defineAttributes () {
    this.attr('name', {})
    this.attr('age', {})
  }
}

defineAttributes(User, {
  name: {},
  age: {}
})

test('测试 dynamicAttributes 起作用了', t => {
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

test('测试 defineAttributesIn: "object" 起作用了', t => {
  const user = new User()
  t.deepEqual(Object.keys(user), ['name', 'age'])
})
