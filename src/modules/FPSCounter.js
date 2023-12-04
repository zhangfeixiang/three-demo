// 2: 每秒帧数计数器
class FPSCounter {
  constructor() {
    this.frames = 0
    this.fps = 0
    this.lastTime = 0
  }
  update(currentTime, e) {
    currentTime = 1000 * currentTime.elapsed
    this.frames++
    if (currentTime > this.lastTime + 1000) {
      this.fps = Math.round(1000 * this.frames / (currentTime - this.lastTime))
      e(this.fps)
      this.lastTime = currentTime
      this.frames = 0
    }
  }
}

export default FPSCounter
