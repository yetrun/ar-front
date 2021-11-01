// 测试 Record 与生俱来的其他方法
const test = require('ava')
const Model = require('../lib/model')

const User = Model.extend({
  attributes: {
    name: {},
    age: {}
  }
})

test('克隆一个 Record', t => {
  const user = new User({ name: 'Jim', age: 18 })
  const copiedUser = user.clone()

  t.deepEqual(user.attributes, copiedUser.attributes)
})
