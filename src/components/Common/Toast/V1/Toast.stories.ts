import store from '@/store'

export default {
  title: 'Common/Toast/V1'
}

export const Toast = () => ({
  data () {
    return {
      notifyId: null,
      warningId: null
    }
  },
  methods: {
    async notify () {
      const { data: { id } } = await store.dispatch('toast/notify', {
        content: 'Notification Toast',
        duration: 10000000
      })

      const self = this as any
      self.notifyId = id
    },
    async warn () {
      const { data: { id } } = await store.dispatch('toast/warning', {
        content: 'Warning Toast',
        duration: 10000000
      })

      const self = this as any
      self.warningId = id
    }
  },
  mounted () {
    const self = this as any

    self.notify()
    self.warn()
  },
  beforeDestroy () {
    const self = this as any
    store.dispatch('toast/remove', { id: self.notifyId, duration: 0 })
    store.dispatch('toast/remove', { id: self.warningId, duration: 0 })
  },
  store,
  template: '<div />'
})
