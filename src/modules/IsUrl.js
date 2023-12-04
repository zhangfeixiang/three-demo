// 30: 判断指定字符串是否为合法网址
// var pattern = /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/
var urlPattern = /^(?:\w+:)?\/\/([^.]+\.\S{2}|localhost[:?\d]*)\S*$/

function IsUrl(t) {
  return urlPattern.test(t)
}

export default IsUrl
