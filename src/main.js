import { observe } from "./observe";
import { compile } from "./complie";
import Watcher from "./watcher";

export default function MiniVue(options) {
  this.$options = options;
  this.$el = document.querySelector(options.el);
  this.init();
}

MiniVue.prototype = {
  init() {
    // MiniVue实例
    this._isMiniVue = true;
    // 初始化数据和方法
    this.initData();
    this.initMethods();
    // 响应化数据
    new observe(this._data, this);
    // 首次解析指令（建立绑定关系）
    new compile(this.$el, this);
    if (this.$options.created) {
      this.$options.created.call(this);
    }
    // 处理 watch
    this.initWatch();
  },
  initData() {
    const vm = this;
    let data = vm.$options.data;
    data = vm._data = typeof data === "function" ? data() : data || {};
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
};

window.MiniVue = MiniVue;
