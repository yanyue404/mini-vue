import Dep from "./dep";
export function Observe(value) {
  if (!value || typeof value !== "object") {
    return;
  }
  // 遍历对象
  Object.keys(value).forEach((key) => {
    defineReactive(value, key, value[key]);
  });
}

export function defineReactive(obj, key, val) {
  // 依赖收集：管理每一个 响应 key
  const dep = new Dep(); // 每个 dep 实例和data 中的每一个 key 有一一对应的关系
  Object.defineProperty(obj, key, {
    get() {
      Dep.target && dep.addDep(Dep.target);
      return val;
    },
    set(newVal) {
      if (newVal === val) {
        return;
      }
      val = newVal;
      // newVal 是对象 继续劫持
      new Observe(newVal);
      // 如果新值是对象 递归监听
      if (typeof newVal === "object") {
        new Observer(newVal);
      }
      // 触发更新
      dep.notify();
    },
  });
  // ! 递归子属性
  Observe(val);
}
