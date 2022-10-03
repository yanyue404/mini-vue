// 保存 data 中的数值和页面中的挂钩关系
import Dep from "./dep";
export default class Watcher { 
  constructor(vm, key, cb) {
    // 创建实例时立刻将该实例指向 Dep.target 便于依赖收集
    this.vm = vm;
    this.key = key;
    this.cb = cb;

    Dep.target = this;
    this.vm[this.key]; // ! 触发依赖收集 (到这一步 get 调用 target 才有值了 )
    Dep.target = null; // ! 收集完清空（等待其他 Watcher 实例化，每一个 watcher 只与自己的 dep 发生关系）
  }
  update() {
    // console.log(this.key + '更新了！');
    this.cb.call(this.vm, this.vm[this.key]);
  }
}
