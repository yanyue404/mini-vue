import { Watcher } from "./watcher";

const tagRE = /\{\{\s*(.*?)\s*\}\}/;
const onRe = /^(v-on:|@)/;
const dirAttrRE = /^v-([^:]+)(?:$|:(.*)$)/;
const bindRe = /^(v-bind:|:)/;
const commonTagRE =
  /^(div|p|span|img|a|b|i|br|ul|ol|li|h1|h2|h3|h4|h5|h6|code|pre|table|th|td|tr|form|label|input|select|option|nav|article|section|header|footer|button|textarea)$/i;
const reservedTagRE = /^(slot|partial|component)$/i;

export class compile {
  constructor(el, vm) {
    this.$vm = vm;
    this.$el = el;
    // 把模板中的内容移动到片段中操作
    this.$fragment = this.node2Fragment(this.$el);
    // 执行编译
    this.compile(this.$fragment);
    // 放回目标 $el
    this.$el.appendChild(this.$fragment);
  }

  node2Fragment(el) {
    const fragment = document.createDocumentFragment();
    let child;
    while ((child = el.firstChild)) {
      // 直接搬家，更改原 dom
      fragment.appendChild(child);
    }
    return fragment;
  }
  compile(el) {
    const childNodes = el.childNodes;
    Array.from(childNodes).forEach((node) => {
      // * 元素类型
      if (node.nodeType === 1) {
        this.compileElement(node);
        // * 文本类型的 —— 插值表达式
      } else if (this.isInterpolation(node)) {
        this.compileText(node);
      }

      // 递归子节点
      if (node.childNodes && node.childNodes.length > 0) {
        this.compile(node);
      }
    });
  }
  compileElement(node) {
    // <div v-model="foo" v-text="test" @click="onClick">
    let nodeAttrs = node.attributes;
    Array.from(nodeAttrs).forEach((attr) => {
      const attrName = attr.name;
      const exp = attr.value;
      // * 指令
      if (this.isDirective(attrName)) {
        const dir = RegExp.$1;
        console.log("解析指令:", dir);
        this[dir] && this[dir](node, this.$vm, exp, dir);
      }
      // * 事件
      if (this.isEvent(attrName)) {
        const dir = attrName.substring(RegExp.$1.length);
        console.log("解析事件:", dir);
        this.eventHandler(node, this.$vm, exp, dir);
      }
    });
  }
  isInterpolation(node) {
    return node.nodeType === 3 && tagRE.test(node.textContent);
  }
  isDirective(attr) {
    return !onRe.test(attr) && dirAttrRE.test(attr);
  }
  isEvent(attr) {
    return onRe.test(attr);
  }
  // 文本替换
  compileText(node) {
    const exp = RegExp.$1;
    console.log("编译插值⽂文本:", exp);
    this.update(node, exp, "text"); // v-text
  }
  update(node, exp, dir) {
    let updatrFn = this[dir + "Updater"];
    updatrFn && updatrFn(node, this.$vm[exp]); // 首次初始化
    // ! 创建 Watcher，初始化编译后完成 exp 属性的依赖收集
    new Watcher(this.$vm, exp, function (value) {
      updatrFn && updatrFn(node, value);
    });
  }

  textUpdater(node, val) {
    // TODO: 插值表达式不能改所有文本
    node.textContent = val;
  }
  modelUpdater(node, val) {
    node.value = val;
  }
  htmlUpdater(node, val) {
    node.innerHTML = val;
  }
  // 事件处理
  eventHandler(node, vm, exp, dir) {
    let fn = vm[exp];
    if (dir && fn) {
      node.addEventListener(dir, fn.bind(vm));
    }
  }
  text(node, vm, exp) {
    this.update(node, exp, "text");
  }
  model(node, vm, exp) {
    this.update(node, exp, "model");
    node.addEventListener("input", (e) => {
      vm[exp] = e.target.value;
    });
  }
  html(node, vm, exp) {
    this.update(node, exp, "html");
  }
}
