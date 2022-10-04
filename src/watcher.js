// 保存 data 中的数值和页面中的挂钩关系
import Dep from "./dep";
export default class Watcher {
  // expOrFn为表达式或一个变量名
  constructor(vm, expOrFn, cb) {
    // 创建实例时立刻将该实例指向 Dep.target 便于依赖收集
    this.vm = vm;
    this.key = expOrFn;
    this.cb = cb;
    this.getter = () => vm[expOrFn];
    // 在创建watcher实例时先取一次值
    this.value = this.get();
  }
  get() {
    // 在读取值时先将观察者对象赋值给Dep.target 否则Dep.target为空 不会触发收集依赖
    Dep.target = this;
    const value = this.getter(); // ! 触发依赖收集 (到这一步 get 调用 target 才有值了 )
    Dep.target = null; // ! 收集完清空（等待其他 Watcher 实例化，每一个 watcher 只与自己的 dep 发生关系）
    return value;
  }
  update() {
    // 触发更新后执行回调函数
    const value = this.get();
    const oldValue = this.value;
    this.cb.call(this.vm, value, oldValue);
    this.value = value;
  }
}
