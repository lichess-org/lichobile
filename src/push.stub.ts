export default {
  isStub: true,

  init() {},

  async register(): Promise<void> {
    return Promise.resolve()
  },

  unregister(): Promise<string> {
    return Promise.resolve('')
  }
}
