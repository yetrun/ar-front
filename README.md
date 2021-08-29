# ar-front

> 一个简单的数据模型包装器，可定义属性和方法，使用 Active Record 风格。

`ar-front` 是一个为前端项目准备的数据模型包装器，当然不经过改造亦可用于后端。一个数据模型即是一个类，数据和行为共同封装在一个类里（曰 Active Record 模式）。例如，包装一个 `User` 模型后，会得到如下的调用体验：

```javascript
// 列表页：获取所有用户，返回一个 User 类的实例数组
const users = await User.list()

// 展示页：获取一个用户详情
const user = await User.find(1)
console.log(user.name)
console.log(user.age)

// 新建页：创建一个 User 实例，设置属性，然后保存
const user = new User()
user.name = 'Jim'
user.age = 18
await user.save()

// 更新页：设置属性，然后保存
const user = await User.find(1)
user.name = 'Jim'
user.age = 18
await user.save()
```

其他更详细的用法参见文档。

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
   * [新的方式：使用继承来定义模型类](#新的方式使用继承来定义模型类)
      * [定义模型](#定义模型)
      * [定义属性](#定义属性)
      * [定义行为](#定义行为)
      * [配置](#配置-1)
      * [与 Model.extend 区别](#与-modelextend-区别)
   * [在 Vue 2.x 中使用](#在-vue-2x-中使用)
* [License](#license)

## 开发理念

有关 `ar-front` 的开发理念，可阅读 [docs/开发理念.md](docs/开发理念.md).

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

### 新的方式：使用继承来定义模型类

不使用 `Model.extend`，可通过继承 `Model` 类来创建新的模型类。

#### 定义模型

```javascript
import { Model } from 'ar-front'

class User extends Model {}
```

#### 定义属性

属性定义放在 `defineAttributes` 静态方法当中

```javascript
import { Model } from 'ar-front'

class User extends Model {
  static defineAttributes () {
    this.attr('id', { type: String })
    this.attr('name', { type: String })
    this.attr('age', { type: Number })
  }
}
```

#### 定义行为

由于模型本身是一个 JavaScript 类语法，可直接在类中定义方法：

```javascript
import { Model } from 'ar-front'

class User extends Model {
  // 定义静态方法
  static list () {
    // ...
  }
    
  // 定义实例方法
  save () {
    // ...
  }
    
  // 定义计算属性
  get fullName () {
    // ...
  }
    
  set fullName () {
    // ...
  }
}
```

#### 配置

可对模型类进行配置：

```javascript
class User extends Model {
  static defaultConfig = {
    dynamicAttributes: true,
    defineAttributesIn: 'object',
    // 未定义 setter 和 deleter，则会自动继承默认定义
  }
}
```

#### 与 `Model.extend` 区别

`Model.extend` 不是创建继承类，而是一个拥有 Model 的实例方法的全新的类。

```javascript
class UserOne extends Model {}
const UserTwo = Model.extend({
  name: 'UserTwo'
})

new UserOne() instanceof Model // true
new UserTwo() instanceof Model // false
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
