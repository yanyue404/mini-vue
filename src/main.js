import { observe } from "./observe";
import { compile } from "./complie";
import { Watcher, nextTick } from "./watcher";

export default function MiniVue(options) {
  this.$options = options;
  this.$el = document.querySelector(options.el);
  this.init();
}

MiniVue.prototype = {
  init() {
    // 存放事件
    this._events = {};
    // MiniVue实例
    this._isMiniVue = true;
    // 初始化数据和方法
    this.initData();
    this.initMethods();
    // 响应化数据
    new observe(this._data, this);
    // 首次解析指令（建立绑定关系）
    new compile(this.$el, this);
    // 处理 watch
    this.initWatch();
    // 执行 created
    if (this.$options.created) {
      this.$options.created.call(this);
    }
  },
  initData() {
    const vm = this;
    let data = vm.$options.data;

    data = vm._data = typeof data === "function" ? data() : data || {};
    this.$data = data;
    const keys = Object.keys(data);

    // 对每一个key实现代理 即可通过vm.msg来访问vm._data.msg
    keys.forEach((key) => {
      vm.proxy(vm, "_data", key);
    });
  },
  initMethods() {
    const vm = this;
    const methods = vm.$options.methods ? vm.$options.methods : {};
    const keys = Object.keys(methods);
    // 将methods上的方法赋值到vm实例上
    keys.forEach((e) => {
      vm[e] = methods[e];
    });
  },
  initWatch() {
    if (this.$options.watch) {
      const watch = this.$options.watch;
      const keys = Object.keys(watch);
      keys.forEach((key) => {
        this.$watch(key, watch[key]);
      });
    }
  },
  proxy(target, sourceKey, key) {
    const sharedPropertyDefinition = {
      enumerable: true,
      configurable: true,
    };

    // 实际上读取和返回的是vm._data上的数据
    sharedPropertyDefinition.get = function proxyGetter() {
      return this[sourceKey][key];
    };
    sharedPropertyDefinition.set = function proxySetter(val) {
      this[sourceKey][key] = val;
    };
    Object.defineProperty(target, key, sharedPropertyDefinition);
  },
  $watch(variable, callback) {
    new Watcher(this, variable, callback);
  },
  // 当为对象添加属性或修改数组的值时可用这个方法 能实时更新
  $set(obj, key, val) {
    this[obj][key] = val;
    this[obj].__ob__.dep.notify();
  },
  // 当为对象删除属性或删除数组的值时可用这个方法 能实时更新
  $delete(obj, key) {
    if (isArray(this[obj])) {
      this[obj].splice(key, 1);
    } else {
      delete this[obj][key];
      this[obj].__ob__.dep.notify();
    }
  },

  $nextTick: nextTick,

  $on(event, fn) {
    (this._events[event] || (this._events[event] = [])).push(fn);
  },

  $off(event, fn) {
    const cbs = this._events[event];
    if (!fn) {
      cbs.length = 0;
      return;
    }
    let l = cbs.length;
    while (l--) {
      let cb = cbs[l];
      if (cb === fn) {
        cbs.splice(l, 1);
      }
    }
  },

  $emit(event) {
    const cbs = this._events[event];
    const args = toArray(arguments, 1);
    if (!cbs) {
      this._events[event] = [];
      return;
    }
    if (args.length > 1) {
      cbs.forEach((cb) => {
        cb.apply(this, args);
      });
    } else {
      cbs.forEach((cb) => {
        cb.call(this, args[0]);
      });
    }
  },

  $once(event, fn) {
    const vm = this;
    function on() {
      vm.$off(event, on);
      fn.apply(this, arguments);
    }
    this.$on(event, on);
  },
};

window.MiniVue = MiniVue;
