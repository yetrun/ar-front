### Collection

新添加的 Collection 模块，用来定义集合资源。

#### 引入方式

```javascript
import { Collection } from 'ar-front'
```

#### `Collection.extend`

定义集合资源的方法，示例：

```javascript
Collection.extend({
  model: User,
  onTransform () {
    // ...
  },
  config: {
    // ...
  }
})
```

##### `model`

`Model.extend` 定义的实例。

##### `onTransform`

自定义收到下游传输时的回调，详细见传输相关的[文档](#传输)。

##### 配置

当前仅有一个配置选项：

- `deleter`: 自定义删除集合内索引的行为，默认是如下的函数：

  ```javascript
  function deleter (index) {
    delete this[index]
  }
  ```

#### `Collection.config`

生成一个拥有其他默认配置的 Collection 模块，示例：

```javascript
Collection.config({
  deleter (index) {
    Vue.delete(this, index)
  }
})
```

#### `constructor`

构造函数可以传递属性数组，例如：

```javascript
const Users = Collection.extend({
  model: User
})

const users = new Users([
  { id: 1, name: 'Jim', age: 18 },
  { id: 2, name: 'Jane', age: 19 }
])
```

#### 调用数组方法

Collection 实例可以调用数组的方法，如 `push`、`splice` 等。

#### `#new`

`new` 方法可以生成一个下游的 Record 实例，例如：

```javascript
const Users = Collection.extend({
  model: User
})

const users = new Users() // users.length === 0

const user = users.new({ name: 'Jim', age: 18 })
await user.save()
// users.length === 1
```

### 传输

传输是新引入的机制，其作用是在上游资源与下游资源之间维护一个通道，使得上游资源自动响应下游资源的数据变更。这里有几个重要的概念：

- 上游资源：可以是 Collection，也可以是 Record
- 下游资源：是上游资源派生出的 Record
- 派生：上游资源生成下游资源，它们之间建立了通道

我将用几个例子解释上游资源如何自动响应下游资源的变化。

#### 演示集合资源的派生

首先，我们定义单个资源和集合资源：

```javascript
const User = Model.extend({
  attributes: {
    id: {}, name: {}, age: {}
  },
  actions: {
    save () {
      // ...
    }
  }
})

const Users = Collection.extend({
  model: User
})
```

然后，我们演示如何由集合资源派生出一个资源：

```javascript
const users = new Users()
const user = users.new()
```

紧接着，更新 `user` 的状态并保存到服务器：

```javascript
user.attributes = { name: 'Jim', age: 18 }
await user.save()
```

最后，展示 `user` 自动添加到 `users` 中：

```javascript
console.log(users[0] === user)
```

#### 演示单个资源的派生

单个资源也可派生资源，它用的是 `derive` 方法。下列代码中，`user2` 即为派生出的资源：

```javascript
const user = new User({ name: 'Jin', age: 18 })
const user2 = user.derive()
```

`user2` 的更新会影响到 `user`，例如：

```javascript
user2.name = 'Jim'
await user2.save()
console.log(user.name) // 'Jim'
```

#### 自定义传输机制

默认情况下，集合资源的默认响应行为是自动添加或删除资源，单个资源的默认响应行为是同步属性。自动添加是根据 `id` 属性判断的，自动删除是当资源拥有一个值为 `true` 的 `destroyed` 属性时。

如果对默认行为不满意，可以自定义，`Model.extend` 和 `Collection.extend` 都可以传递 `onTransform` 选项：

```javascript
Model.extend({
  onTransform (downstreamRecord, upstreamRecord) {
    // 自定义响应行为
  }
})

Collection.extend({
  onTransform (downstreamRecord, upstreamCollection) {
    // 自定义响应行为
  }
})
```
