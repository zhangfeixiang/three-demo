/**
 * 52
 */
class Util {
  static isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.platform)
  }
  static isSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  }
  static isFirefoxAndroid() {
    return navigator.userAgent.indexOf('Firefox') !== -1 && navigator.userAgent.indexOf('Android') !== -1
  }
  static isLandscapeMode() {
    return window.orientation === 90 || window.orientation === -90
  }
  static isTimestampDeltaValid(t) {
    return isNaN(t) ? !1 : t <= Util.MIN_TIMESTEP ? !1 : !(t > Util.MAX_TIMESTEP)
  }
}

Util.MIN_TIMESTEP = 0.001
Util.MAX_TIMESTEP = 1
window.Util = Util
export default Util
