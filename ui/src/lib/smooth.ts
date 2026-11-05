export class SmoothStream {
  private target = ''
  private shown = ''
  private timer: number | null = null
  private done = false
  private waiter: (() => void) | null = null

  constructor(
    private readonly onUpdate: (text: string) => void,
    private readonly interval = 45
  ) {}

  push(chunk: string): void {
    if (!chunk) return
    this.target += chunk
    if (this.timer == null && !this.done) {
      this.timer = window.setInterval(this.tick, this.interval)
    }
  }

  private tick = (): void => {
    const backlog = this.target.length - this.shown.length
    if (backlog > 0) {
      const take = Math.max(2, Math.ceil(backlog * 0.25))
      this.shown = this.target.slice(0, this.shown.length + take)
      this.onUpdate(this.shown)
      return
    }
    if (this.done) this.stop()
  }

  private stop(): void {
    if (this.timer != null) {
      window.clearInterval(this.timer)
      this.timer = null
    }
    const waiter = this.waiter
    this.waiter = null
    waiter?.()
  }

  async finish(): Promise<void> {
    this.done = true
    if (this.shown.length >= this.target.length) {
      this.stop()
      return
    }
    await new Promise<void>((resolve) => {
      this.waiter = resolve
    })
  }
}
