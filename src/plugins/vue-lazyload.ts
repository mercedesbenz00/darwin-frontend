import Vue from 'vue'
import VueLazyload from 'vue-lazyload'

export const installVueLazyload = (_Vue: typeof Vue) => {
  _Vue.use(VueLazyload, { attempt: 1 })
}
