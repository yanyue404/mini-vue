import Dep from "./dep";
import { isArray, hasOwn, def } from "./utils";

// 在数组原型上增加一点改动
const arrayProto = Array.prototype;
const arrayMethods = Object.create(arrayProto);

const methodsToPatch = ["push", "pop", "shift", "unshift", "splice", "sort", "reverse"];

methodsToPatch.forEach(function (method) {
  // 缓存原型自身的方法
  const original = arrayProto[method];
  def(arrayMethods, method, function mutator(...args) {
    // 先执行原型自身的方法
    const result = original.apply(this, args);
    const ob = this.__ob__;
    let inserted;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
        break;
    }
    if (inserted) {
      ob.observeArray(inserted);
    }
    // 触发依赖更新
    ob.dep.notify();
    return result;
  });
});

export function observe(value) {
  if (!value || typeof value !== "object") {
    return;
  }
  let ob;
  // 为 value 创建一个 Observer 实例，避免重新侦测 value 变化
  if (hasOwn(value, "__ob__") && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (!value._isMiniVue) {
    ob = new Observer(value);
  }

  return ob;
}

// 对数据进行监听
function Observer(value) {
  this.value = value;
  this.dep = new Dep(); // 新增 dep
  // 标记 __obj__，方便在拦截器中获取 Observer 实例
  def(value, "__ob__", this);

  if (isArray(value)) {
    value.__proto__ = arrayMethods;
    this.observeArray(value);
  } else {
    this.walk(value);
  }
}

Observer.prototype = {
  walk(obj) {
    const keys = Object.keys(obj);
    for (let i = 0, len = keys.length; i < len; i++) {
      defineReactive(obj, keys[i], obj[keys[i]]);
    }
  },
  observeArray(arry) {
    arry.forEach((item) => {
      observe(item);
    });
  },
};

export function defineReactive(obj, key, val) {
  const dep = new Dep();
  // 递归监听，有可能是数组
  let childOb = observe(val); 

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      // 收集对应的观察者对象
      if (Dep.target) {
        dep.depend();
        // 新增收集
        if (childOb) {
          childOb.dep.depend();
        }
        if (isArray(val)) {
          for (let e, i = 0, l = val.length; i < l; i++) {
            e = val[i];
            e && e.__ob__ && e.__ob__.dep.depend();
          }
        }
      }
      return val;
    },
    set(newVal) {
      if (val === newVal) {
        return;
      }
      val = newVal;
      // 递归监听
      childOb = observe(newVal);
      // 触发更新
      dep.notify();
    },
  });
}
