// 保存 data 中的数值和页面中的挂钩关系
import Dep from "./dep";

// watcher实例的ID 每个watcher实现的ID都是唯一的
let uid = 0;

export class Watcher {
  // expOrFn为表达式或一个变量名
  constructor(vm, expOrFn, cb) {
    this.id = uid++;
    // 创建实例时立刻将该实例指向 Dep.target 便于依赖收集
    this.vm = vm;
    this.key = expOrFn;
    this.cb = cb;
    // 存放dep实例
    this.deps = [];
    // 存放dep的ID
    this.depIds = new Set();
    // 更新触发回调函数
    this.getter = () => vm[expOrFn];
    // 需要把 expr 的旧值给存储起来
    this.oldValue = this.vm.$data[expOrFn];
    // 在创建watcher实例时先取一次值
    this.value = this.get();
    if (expOrFn === "arr") {
      console.log("init ----", JSON.stringify(this.value));
    }
  }
  get() {
    // 在读取值时先将观察者对象赋值给Dep.target 否则Dep.target为空 不会触发收集依赖
    Dep.target = this;
    const value = this.getter(); // ! 触发依赖收集 (到这一步 get 调用 target 才有值了 )
    Dep.target = null; // ! 收集完清空（等待其他 Watcher 实例化，每一个 watcher 只与自己的 dep 发生关系）
    return value;
  }
  addDep(dep) {
    // 触发依赖 dep添加观察者对象 同时观察者对象也会将dep实例添加到自己的deps里
    // 如果dep已经存在deps里 则不添加
    // dep中存放着对应的watcher watcher中也会存放着对应的dep
    // 一个dep可能有多个watcher 一个watcher也可能对应着多个dep
    if (!this.depIds.has(dep.id)) {
      this.deps.push(dep);
      this.depIds.add(dep.id);
      dep.addSub(this);
    }
  }
  update() {
    pushWatcher(this);
  }
  run() {
    // 触发更新后执行回调函数
    const value = this.get();
    const oldValue = this.value;
    // FIXME: 旧值总是更新成新的
    if (value !== oldValue) {
      this.cb.call(this.vm, value, oldValue);
    } else {
      console.log("没有变化======");
    }
    this.value = value;
  }
}

const queue = [];
let has = {};
let waiting = false;

function pushWatcher(watcher) {
  const id = watcher.id;
  // 如果已经有相同的watcher则不添加 防止重复更新
  if (has[id] == null) {
    has[id] = queue.length;
    queue.push(watcher);
  }

  if (!waiting) {
    waiting = true;
    // 下次事件循环执行，任务队列 queue 已经缓存了这一轮 filter 后要执行的 n 多个事件
    nextTick(flushQueue);
  }
}

function flushQueue() {
  queue.forEach((q) => {
    q.run();
  });

  // 执行完，重置
  waiting = false;
  has = {};
  queue.length = 0;
}

export function nextTick(cb, ctx) {
  const p = Promise.resolve();
  p.then(() => {
    ctx ? cb.call(ctx) : cb();
  });
}
