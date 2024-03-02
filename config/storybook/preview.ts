import { PiniaVuePlugin } from 'pinia'
import VTooltip from 'v-tooltip'
import Vue from 'vue'
import VModal from 'vue-js-modal'
import VueVirtualScroller from 'vue-virtual-scroller'

import clickOutsideDirective from '@/directives/click-outside'
import loadingDirective from '@/directives/loading'
import Toast from '@/plugins/ToastController'
import { installCommonComponents } from '@/plugins/components'
import Features from '@/plugins/features'
import Theme from '@/plugins/theme'
import { installVueLazyload } from '@/plugins/vue-lazyload'
import { installVueToasted } from '@/plugins/vue-toasted'
import store from '@/store'

require(/* webpackMode: "lazy-once" */ '@/assets/styles/index.darwin.scss')
require('vue-virtual-scroller/dist/vue-virtual-scroller.css')

Vue.use(VTooltip, { defaultHtml: true, defaultBoundariesElement: document.body, defaultDelay: 500 })
installVueLazyload(Vue)
installVueToasted(Vue)
installCommonComponents(Vue)
Vue.directive('loading', loadingDirective)
Vue.directive('click-outside', clickOutsideDirective)
Vue.use(Features, store)
Vue.use(Theme)
Vue.use(VModal, { dynamic: true })
Vue.use(Toast)
Vue.use(VueVirtualScroller)
Vue.use(PiniaVuePlugin)

export const parameters = { controls: { expanded: true } }
