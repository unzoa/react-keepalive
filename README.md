# keepAlive

## 功能

1. 记录路由页面缓存
2. 记录路由相对于document的滚动高度

<br>

## 使用

**注意**：路由离开时，HOC页面会被清空后再添加入新的页面，会有一次滚动top为0

**注意场景** 如果路由组件也有监听scroll

```jsx
import { KeepAliveProvider, withKeepAlive } from '../components/keepAlive'
import Feed from './feed/Feed'

const KeepAliveFeed = withKeepAlive( Feed, { cacheId: 'feed', scroll: true } )

...

<Router>
  <KeepAliveProvider>
    <Routes>
      <Route path="/Feed" element={ <KeepAliveFeed /> } />
    </Routes>
  </KeepAliveProvider>
</Router>
```

withKeepAlive参数说明
| 参数 | 类型 | 说明 |
| --- | --- | --- |
| cacheId | string | 自定义缓存路由key |
| scroll | boolean | 是否记录页面滚动距离 |

<br>

## 原理

1. 利用state记录渲染过的dom节点缓存；
2. 再用ref获取父节点，添加dom节点缓存

<br>

## 实现

### 思路

1. 利用Context广播缓存函数
2. 高阶函数HOC，组装组件，执行缓存函数
3. reducer记录组件节点缓存
4. HOC中dom利用ref，赋值缓存

<br>

### 执行流程

> **知识点** 函数组件的最新state只能在下一次函数重新执行的时候拿到。需要理解类组件和函数组件的区别。类组件有自己的实例，每次update只会重新执行render函数。而函数组件每次update都会重新执行整个函数。函数组件里的state更改，只能在下一次函数执行的时候拿到最新的值。

- 第一阶段：创建组件缓存对象
```
withKeepAlive
  return 上 因为import
KeepAliveProvider
  - return 上
  - return 中
withKeepAlive
  return 中
    createEvent 组件准备添加
KeepAliveProvider
  - return 中
    if(!comp) createEvent 添加缓存对象, 此时组件的dom没有创建
```
结果：{cacheId, reactElement, reactElementDom: null, alive: 0}

<br>

- 第二阶段：组件缓存对象添加dom节点
```
KeepAliveProvider
  - return 上
  - return 中
    comps遍历，添加组件缓存对象中的dom节点
withKeepAlive
  return 中
    createEvent 组件准备添加，**因为本次UI更新后comps添加了dom，dom需要在下一次更新后才会有**
KeepAliveProvider
  - return 中
    if (comp) createEvent 组件缓存对象中dom 创建完成
```
结果：{cacheId, reactElement, reactElementDom: dom, alive: 1}

<br>

- 第三阶段：读取组件缓存对象dom节点
```
KeepAliveProvider
  - return 上
  - return 中
withKeepAlive
  return 中
    读取组件缓存中组件dom节点，并从cacheId节点下移动过来
```
结果：同二
