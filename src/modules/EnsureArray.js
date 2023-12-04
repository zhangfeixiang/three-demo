// 28: 确保输入参数以数组形式返回
import _ from 'lodash'

function isObject(t) {
  return Object.prototype.toString.call(t) === '[object Object]'
}
function isArguments(t) {
  return Object.prototype.toString.call(t) === '[object Arguments]'
}
function valueByKey(t) {
  return _.values(t)
  // return Object.keys(t).map(function(e) {
  //   return t[e]
  // })
}

export default function(t, e) {
  if (!t) t = []
  if (isArguments(t)) t = [].splice.call(t, 0)
  if (isObject(t) && e) t = valueByKey(t)
  return Array.isArray(t) ? t : [t]
}
