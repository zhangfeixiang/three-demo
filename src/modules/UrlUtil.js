// 31: Url 工具类
// import path from 'path'
import NormalUrl from './NormalUrl'
import EnsureArray from './EnsureArray'
import IsUrl from './IsUrl'

var UrlUtil = function() {
    var urls = EnsureArray(arguments).map(replaceUndefined)
    return NormalUrl.apply(NormalUrl, urls);
    // return isUri(urls[0]) ? NormalUrl.apply(NormalUrl, urls) : path.join.apply(path, urls)
  },
  isUri = UrlUtil.isUrl = function(schema) {
    return IsUrl(schema) || schema === 'http://' || schema === 'https://' || schema === 'ftp://'
  },
  replaceUndefined = UrlUtil.replaceUndefined = function(t, e, n) {
    // return void 0 === t || t === null ? isUri(n[0]) ? '/' : path.sep : t
    return void 0 === t || t === null ? isUri(n[0]) ? '../' : '../' : t
  }
export default UrlUtil
