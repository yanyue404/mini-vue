import { Observe } from "./observe";
import { Compile } from "./complie";

export default function MiniVue(options) {
  this.$options = options;
  this.$el = options.el;
  this.$data = options.data;
  //  响应化数据
  new Observe(this.$data, this);

  new Compile(options.el, this);

  if (options.created) {
    options.created.call(this);
  }
}

window.MiniVue = MiniVue;
