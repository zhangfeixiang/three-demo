// 35: 网址规格化
function normalSeperator(t) {
  return t.replace(/[/]+/g, '/').replace(/\/\?/g, '?').replace(/\/#/g, '#').replace(/:\//g, '://')
}

export default function() {
  var t = [].slice.call(arguments, 0).join('/')
  return normalSeperator(t)
}
