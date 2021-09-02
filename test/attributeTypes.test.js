const test = require('ava')
const Model = require('../lib/model')

const User = Model.extend({
  attributes: {
    name: { type: String },
    age: { type: Number }
  }
})

const TypesModel = Model.extend({
  attributes: {
    aString: { type: String },
    aNumber: { type: Number },
    aBoolean: { type: Boolean },
    aDate: { type: Date },
    anArray: { type: Array },
    anObject: { type: Object }
  }
})

test('string is not number', t => {
  t.not('18', 18)
})

test('convert types in constructor', t => {
  const user = new User({ name: 'Jim', age: '18' })

  t.is(user.name, 'Jim')
  t.is(user.age, 18)
})

test('convert types in .attributes method', t => {
  const user = new User()
  user.attributes = { name: 'Jim', age: '18' }

  t.is(user.name, 'Jim')
  t.is(user.age, 18)
})

test('convert types in setter', t => {
  const user = new User()
  user.name = 'Jim'
  user.age = '18'

  t.is(user.name, 'Jim')
  t.is(user.age, 18)
})

test('not convert undefined', t => {
  const model = new TypesModel({ 
    aString: undefined,
    aNumber: undefined,
    aBoolean: undefined,
    aDate: undefined,
    anArray: undefined,
    anObject: undefined,
  })
  t.is(model.aString, undefined)
  t.is(model.aNumber, undefined)
  t.is(model.aBoolean, undefined)
  t.is(model.aDate, undefined)
  t.is(model.anArray, undefined)
  t.is(model.anObject, undefined)
})

test('not convert null', t => {
  const model = new TypesModel({ 
    aString: null,
    aNumber: null,
    aBoolean: null,
    aDate: null,
    anArray: null,
    anObject: null,
  })
  t.is(model.aString, null)
  t.is(model.aNumber, null)
  t.is(model.aBoolean, null)
  t.is(model.aDate, null)
  t.is(model.anArray, null)
  t.is(model.anObject, null)
})
