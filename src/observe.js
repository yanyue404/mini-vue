import Dep from "./dep";
export function Observe(value, vm) {
  if (!value || typeof value !== "object") {
    return;
  }
  // 遍历对象
  Object.keys(value).forEach((key) => {
    defineReactive(value, key, value[key]);
    // 代理理到vm上
    proxyData(vm, key);
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
      if (newVal !== val) {
        val = newVal;
        console.log(`当前管理依赖项 ${key} 的:`, dep);
        dep.notify();
      }
    },
  });
  // 递归
  Observe(val);
}

export function proxyData(vm, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm.$data[key];
    },
    set(newVal) {
      vm.$data[key] = newVal;
    },
  });
}
