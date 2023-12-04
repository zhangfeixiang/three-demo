function toColor(num) {
  num >>>= 0
  var b = num & 0xFF,
    g = (num & 0xFF00) >>> 8,
    r = (num & 0xFF0000) >>> 16,
    a = ((num & 0xFF000000) >>> 24) / 255
  return 'rgba(' + [r, g, b, a].join(',') + ')'
}


function VBColorToHEX(i) {
  var bbggrr =  ("000000" + i.toString(16)).slice(-6);
  var rrggbb = bbggrr.substr(4, 2) + bbggrr.substr(2, 2) + bbggrr.substr(0, 2);
  return "#" + rrggbb;
}

function HEXToVBColor(rrggbb) {
  var bbggrr = rrggbb.substr(4, 2) + rrggbb.substr(2, 2) + rrggbb.substr(0, 2);
  return parseInt(bbggrr, 16);
}