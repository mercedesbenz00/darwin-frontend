import VueToast from 'vue-toasted'
import { VueConstructor } from 'vue/types/umd'

export const installVueToasted = (Vue: VueConstructor): void => {
  Vue.use(VueToast, {
    position: 'bottom-center',
    duration: 550,
    iconPack: 'fontawesome',
    closeOnSwipe: false,
    theme: 'bubble'
  })
}
