// 演示酷家乐模型加载方式

import ArrayBufferFileLoader from './modules/10'
var loader = new ArrayBufferFileLoader()
loader.load('//qhsmodel.kujiale.com/pop/VYpb0UNnRUNHdwFBAAAA/m.pop', function(res) {
  // 查看通过 ArrayBufferFileLoader 加载后得到的资源信息 res
  debugger
})

 // 测试 blob 文件加载方式
  loader.setResponseType('blob')
  loader.load('xxx.lob', function(blob) {
    if (blob instanceof Blob) {
      var reader = new FileReader()
      reader.readAsBinaryString(blob)
      reader.onload(function(evt) {
        if (evt.target.readyState === FileReader.DONE) {
          var result = evt.target.result
          window.URL = window.URL || window.webkitURL
          var source = window.URL.createObjectURL(blob)
          console.log(source)
        }
      })
    }
  })
