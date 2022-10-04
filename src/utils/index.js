export const isArray = Array.isArray;

export function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}

/**
 * 在 obj 上新增不可枚举属性 key，值为 val
 * @export
 * @param {Object} obj
 * @param {String} key
 * @param {any} val
 * @param {Boolean} enumerable 当且仅当该属性的 enumerable 键值为 true 时，该属性才会出现在对象的枚举属性中
 */
export function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true,
  });
}
