# ar-front

> An active record style data mapper for web front-end.

`ar-front` 是一个 ActiveRecord 风格的前端数据层。所谓 ActiveRecord 风格，是指将数据和行为封装在同一个类里。例如，你将得到类似如下的 API 体验：

```javascript
// 获取所有用户
const users = await User.list()

// 遍历数组的数据
for (const user of users) {
  console.log(`User[id=${user.id}, name=${user.name}, age=${user.age}]`)
}

// 根据 id 获取单条用户数据
const user = await User.find(1)

// 创建一条用户数据
const user = new User({ name: 'James', age: 18 })
await user.save()

// 亦可修改 `user` 的值后继续保存
user.name = 'James Dean'
user.age += 1
await user.save()
```

以上仅是冰山一角，想获得完整的体验请使用 `ar-front` 库。

## 目录

* [开发理念](#开发理念)
* [安装](#安装)
* [快速上手](#快速上手)
* [使用指南](#使用指南)
   * [访问和设置属性](#访问和设置属性)
   * [Model.extend](#modelextend)
      * [类名称](#类名称)
      * [属性](#属性)
      * [计算属性](#计算属性)
      * [实例方法](#实例方法)
      * [静态方法](#静态方法)
      * [配置](#配置)
      * [混入](#混入)
   * [Model.config](#modelconfig)
   * [attributes](#attributes)
   * [$model](#model)
   * [在 Vue 2.x 中使用](#在-vue-2x-中使用)
* [License](#license)

## 开发理念

开篇即介绍开发理念不知火舞，但由于现在的轮子太多了，为避免浪费大家的时间，还是有必要对 `ar-front` 的开发理念做出必要的说明。如果它不是适合你，你就不用考虑它。

首先，`ar-front` 库很轻量，它仅仅是将我们平时写接口的方式做了 ActiveRecord 风格的封装。如果你厌倦了 Plain Object 的数据传输方式，可以考虑使用 `ar-front` 将一切数据的行为封装到类里。这样会让你的代码显得更有组织，调用起来也更方便，并且只是增加了一点点的复杂性。

其次，`ar-front` 库的更新将会很频繁。由于处于项目开发初期，设计的模式、使用的技术、提供的 API、甚至是库的名称等，都有可能会变动。

最后，`ar-front` 不是一个很有野心的库，这意味着你必须清楚 `ar-front` 不能做什么。目前 `ar-front` 尚不能做到的事情有：

- 它不是一个数据仓库（Store）。
- 它不支持关系映射（Relation）：由于面向的是五花八门的后端接口，前端 API 的关系映射很难有种统一的方法实现。这一点不像面对标准的数据库的时候那样好定义和处理。尽管这样，还是可以在 `ar-front` 中手动定义调用关系的方法，这种硬实现应该也可以满足需要。
- 目前它还不支持验证（Validation）：已经有库支持在表单层面实现验证工作了，如果这能够满足需求，就不再考虑在 `ar-front` 中重复实现了。
- 目前它还不支持回调（Callbacks）：回调看似很有用，但不知道是否真的那么有用。如果不是那么有用，也不考虑在 `ar-front` 中实现了。

总之一句话，`ar-front` 只想着如何组织和简化 Web API 的调用，这才是它最适合的应用场景。当然了，如果你的数据交互不是基于 Web API，而是 localStorage、IndexedDB 甚至是内存等，也是它适合的应用场景。

## 安装

由于当前正在开发中，直接通过 github 仓库获取到最新的稳定开发版：

```bash
# 使用 yarn
$ yarn add https://github.com/yetrun/ar-front.git

# 使用 npm
$ npm install --save https://github.com/yetrun/ar-front.git
```

## 快速上手

假设后端提供操作用户的 Restful API.

```javascript
const axios = require('axios')
const { Model } = require('ar-front')

// 定义模型类
const User = Model.extend({
  // 定义属性
  attributes: {
    name: { type: String },
    age: { type: Number }
  },
  // 定义行为
  actions: {
    async save () {
      if (this.id) {
        const { data } = await axios.put(`/users/${this.id}`, this.attributes)
        this.attributes = data
      } else {
        const { data } = await axios.post('/users', this.attributes)
        this.attributes = data
      }
    }
  },
  static: {
    async list () {
      const { data } = await axios.get('/users')
      return data.map(dataItem => new User(dataItem))
    },
    async find (id) {
      const { data } = await axios.get(`/users/${id}`)
      return new User(data)
    }
  }
})

// 返回用户列表
const users = await User.list()

// 创建用户
const user = new User()
user.name = 'James'
user.age = 18
await user.save()

// 更新用户
const user = User.find(1)
user.name = 'James Dean'
user.age += 1
await user.save()
```

## 使用指南

### 访问和设置属性

`ar-front` 最大的优点是直接在对象上设置和返回属性，并能够自动进行类型转换和设置默认值。

现有个简单的模型类定义：

```javascript
const User = Model.extend({
  attributes: {
    name: { type: String },
    age: { type: Number, default () { return 18 } }
  }
})
```

直接在对象层面访问和设置属性如下：

```
const user = new User()

// 初始化即有默认值
console.log(user.name) // null
console.log(user.age) // 18

// 可通过属性直接在对象层面设置和获取
user.name = 'Jim'
console.log(user.name) // 'Jim'

// 自动进行类型转换
user.age = '18'
console.log(user.age) // 18
console.log(typeof user.age) // 'number'
```

### `Model.extend`

```javascript
const { Model } = require('ar-front')

Model.extend({
  name: '...',
  attributes: { /*...*/ },
  computed: { /*...*/ },
  actions: { /*...*/ },
  static: { /*...*/ },
  config: { /*...*/ }
})
```

#### 类名称

使用 `name` 定义模型类的名称。

示例：

```javascript
const User = Model.extend({
  name: 'User'
})

console.log(User.name) // 'User'
```

#### 属性

使用 `attributes` 块定义计算属性，可定义属性的类型和默认值。

- 类型：支持以下五种类型的定义。除非是 `Object`，否则当设置属性时，自动进行类型转换。
  - Number
  - String
  - Boolean
  - Date
  - Array
  - Object
- 默认值：可设置常量值或函数，函数绑定的 `this` 是模型实例。

示例：

```javascript
const User = Model.extend({
  attributes: {
    name: { type: String },
    age: { type: Number, default: 18 },
    registeredAt: { type: Date, default () { return new Date() }}
  }
})
```

#### 计算属性

使用 `computed` 块定义计算属性。

示例：

```javascript
const User = Model.extend({
  attributes: {
    firstName: { type: String },
    lastName: { type: String }
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

let user = new User({ firstName: 'James', lastName: 'Dean' })
console.log(user.fullName === 'James Dean')

user = new User()
user.fullName = 'James Dean'
console.log(user.firstName === 'James')
console.log(user.lastName === 'Dean')
```

#### 实例方法

使用 `actions` 块定义实例方法。

示例：

```javascript
const User = Model.extend({
  actions: {
    async save () {
      // ...
    },
    getFullName () {
      // ...
    }
  }
})

user = new User()
await user.save()
user.getFullName()
```

#### 静态方法

使用 `static` 块定义静态方法。

示例：

```javascript
const User = Model.extend({
  static: {
    async find () {
      // ...
    },
    current () {
      // ...
    }
  }
})

await User.find(1)
User.current()
```

#### 配置

使用 `config` 块定义配置。

示例：

```javascript
Model.extend({
  config: {
    dynamicAttributes: true,
    defineAttributesIn: 'object',
    setter: function () { /* ... */ },
    deleter: function () { /* ... */ }
  }
})
```

返回：模型类。

选项解释：

- `dynamicAttangributes`：是否支持动态属性，默认为 `false`. 默认情况下，`this.attributes` 只能返回和设置在 `attributes` 块中定义的属性：

  ```javascript
  const User = Model.extend({
    attributes: { name: {}, age: {} }
  })
  
  const user = new User({ name: 'Jim', foo: 'foo' })
  console.log('foo' in user) // false
  
  user.attributes = { name: 'James', bar: 'bar' }
  console.log('bar' in user) // false
  ```

  而一旦设置 `dynamicAttributes` 为 `true`，则 `this.attributes` 会接受额外的属性。将上面的 Model 定义修改为：

  ```javascript
  const User = Model.extend({
    attributes: { name: {}, age: {} },
    config: { dynamicAttributes: true }
  })
  ```

  则相应的行为将会改变：

  ```javascript
  const user = new User({ name: 'Jim', foo: 'foo' })
  console.log('foo' in user) // true
  
  user.attributes = { name: 'James', bar: 'bar' }
  console.log('foo' in user) // false
  console.log('bar' in user) // true
  ```

  设置 `dynamicAttributes` 为 `true` 可以简化定义，例如最简单的设置 Model 的方式可以为：

  ```javascript
  const User = Model.extend({
    config: {
      dynamicAttributes: true
    }
  })
  ```

  但它的侵入性很大，除非特殊情况，还是建议使用明确声明 `attributes` 的方式。

- `defineAttributesIn`：可选值有 `prototype` 和 `object`，默认值是 `prototype`. 它选择将属性的 `getter` 和 `setter` 设置在对象上还是原型上。假设我们设置 Model 为：

  ```javascript
  const User = Model.extend({
    attributes: { name: {}, age: {} }
  })
  
  const user = new User({ name: 'Jim', age: 18 })
  ```

  如果设置 `defineAttributesIn` 为 `prototype`，则属性设置在原型上：

  ```javascript
  Object.keys(user) // []
  Object.keys(Object.getPrototypeOf(user)) // ['name', 'age']
  ```

  反之，如果 `defineAttributesIn` 为 `object`，则属性设置在对象上：

  ```javascript
  Object.keys(user) // ['name', 'age']
  Object.keys(Object.getPrototypeOf(user)) // []
  ```

- `setter`：自定义设置属性的方式，默认值是类似于下面行为的函数：

  ```javascript
  function (key, value) {
    this[key] = value
  }
  ```

- `deleter`：自定义删除属性的方式，默认值是类似于下面行为的函数：

  ```javascript
  function (key) {
    delete this[key]
  }
  ```

####  混入

使用 `mixin` 部分配置混入，示例：

```javascript
const restfulActions = {
  actions: {
    update () { /*...*/ },
    destroy () { /*...*/ }
  },
  static: {
    list () { /*...*/ },
    find (id) { /*...*/ },
    create (attrs) { /*...*/ }
  }
}

Model.extend({
  attributes: {
    name: {},
    age: {}
  },
  mixin: [
    restfulActions,
    // add other mixins
  ]
})
```

### `Model.config`

返回一个定制新的默认配置的 Model 类。如果你对默认的 Model 配置不满意，可以调用此方法生成一个新的 Model 类。

例如下面新生成的 Model 类默认支持动态属性：

```javascript
const NewModel = Model.config({
  dynamicAttributes: true
})

// 新的 Model 类也支持 extend 方法
const User = NewModel.extend()

// 可直接使用动态属性
const user = new User({ name: 'Jim', age: 18 })
console.log(user.name) // 'Jim'
console.log(user.age) // 18
```

### `attributes`

定制 action 是通过 `attributes` 的 setter 和 getter 来实现的。我们还是以下面的模型类定义为例：

```javascript
const User = Model.extend({
  attributes: {
    name: { type: String },
    age: { type: Integer }
  }
})
```

首先，可通过构造函数设置属性：

```javascript
const user = new User({ name: 'Jim', age: 18 )
```

亦可通过 `attributes` 设置器：

```javascript
const user = new User()
user.attributes = { name: 'Jim', age: 18 }
```

`attributes` 的返回器将返回属性的键值对：

```javascript
user.attributes // { name: 'Jim', age: 18 }
```

一般是在定义 action 时使用 `attributes` 的 setter 和 getter，例如一个创建动作，代码实现是：

```javascript
async create () {
  const { data } = await axios.post('/users', this.attributes )
  this.attributes = data
}
```

而不是用下面的代码，这样失去了使用 `ar-front` 库的意义了：

```javascript
async create () {
  const { data } = await axios.post('/users', { name: this.name, age: this.age } )
  this.name = data.name
  this.age = data.age
}
```

`attributes` 的设置会完全覆盖所有属性（它不是更新）。如果你有下面的模型实例：

```javascript
user = new User({ name: 'Jim' })
```

下面的 `attributes` 覆盖会将 `name` 设置为 `null`：

```javascript
user.attributes = { age: 18 }

user.name // null
user.age // 18
```

### `$model`

在实例对象上调用 `$model` 方法可返回模型类。

示例：

```javascript
const User = Model.extend({
  name: 'User'
})

const user = new User()
console.log(user.$model === User) // true
console.log(user.$model.name)  // 'User'
```

### 在 Vue 2.x 中使用

我很喜欢 Vue 库，所以当然希望它在 Vue 中能够实现双向绑定。Vue 2.x 曾说过，绑定的对象需要是 Plain Object 的，但其实并不完全是，`ar-front` 库可以很好地在 Vue 中使用，只不过需要结合一些特别的配置。

想要在 Vue 2.x 中使用，只需要生成一个新的 Model 类。如下生成一个新的 Model 类并保存在 `model.js` 文件内：

```javascript
// model.js
import Vue from 'vue'
import { Model } from 'ar-front'

export default Model.config({
  defineAttributesIn: 'object',
  setter (key, value) {
    Vue.set(this, key, value)
  },
  deleter (key) {
    Vue.delete(this, key)
  }
})
```

定制模型类时引入 `model.js` 即可：

```javascript
// user.js
import Model from './model'

export default Model.extend({
  name: 'User',
  attributes: {
    // ...
  }
})
```

## License

Apache-2.0
