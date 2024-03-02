// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import './registerServiceWorker'
import * as FullStory from '@fullstory/browser'
import { createPinia, PiniaVuePlugin } from 'pinia'
import PortalVue from 'portal-vue'
import VTooltip from 'v-tooltip'
import Vue from 'vue'
import VueCroppie from 'vue-croppie'
import VModal from 'vue-js-modal'
import VueObserveVisibility from 'vue-observe-visibility'
import VueVirtualScroller from 'vue-virtual-scroller'

import VueIntercom from '@mathieustan/vue-intercom'

import Toast from '@/plugins/ToastController'

import App from './App.vue'
import clickOutsideDirective from './directives/click-outside'
import enterDirective from './directives/enter'
import escDirective from './directives/esc'
import inputAutoBlurDirective from './directives/input-auto-blur'
import loadingDirective from './directives/loading'
import { setupGoogleAnalytics } from './initializers/setupGoogleAnalytics'
import { setupHeap } from './initializers/setupHeap'
import { setupSentry } from './initializers/setupSentry'
import Abilities from './plugins/abilities'
import { installCommonComponents } from './plugins/components'
import Features from './plugins/features'
import SentryPlugin from './plugins/sentry'
import Theme from './plugins/theme'
import { installVueLazyload } from './plugins/vue-lazyload'
import { installVueToasted } from './plugins/vue-toasted'
import router from './router'
import store from './store'
import { TeamPayload, UserPayload } from './store/types'
import { resolveVariable } from './utils/config'
import { pluralize } from './utils/pluralize'

import './assets/styles/index.darwin.scss'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

setupGoogleAnalytics(Vue)
setupSentry(Vue)
setupHeap()

const fullstoryId = resolveVariable(process.env.VUE_APP_FULLSTORY_ID, '$FULLSTORY_ID')
const environment = resolveVariable(process.env.VUE_APP_ENVIRONMENT, '$ENVIRONMENT')
if (fullstoryId !== null && fullstoryId !== '') {
  FullStory.init({ orgId: fullstoryId, debug: !fullstoryId })
  Vue.prototype.$FullStory = FullStory
}
Vue.use(PortalVue)
Vue.use(VueCroppie)
Vue.use(VueIntercom, {
  appId: resolveVariable(process.env.VUE_APP_INTERCOM_APP_ID, '$INTERCOM_APP_ID')
})
Vue.use(SentryPlugin)
Vue.use(VModal, { dynamic: true })
Vue.use(
  VTooltip,
  {
    defaultHtml: true,
    defaultBoundariesElement: document.body,
    defaultDelay: 500
  }
)
Vue.use(Toast)
Vue.use(VueObserveVisibility)
Vue.use(Abilities, store)
Vue.use(Features, store)
Vue.use(VueVirtualScroller)
Vue.use(PiniaVuePlugin)
Vue.filter('pluralize', pluralize)
installVueLazyload(Vue)
installVueToasted(Vue)
installCommonComponents(Vue)

Vue.directive('click-outside', clickOutsideDirective)
Vue.directive('input-auto-blur', inputAutoBlurDirective)
Vue.directive('loading', loadingDirective)
Vue.directive('esc', escDirective)
Vue.directive('enter', enterDirective)

Vue.use(Theme)

Vue.config.productionTip = false

// Logic around identifying users on Fullstory
store.subscribe((mutation) => {
  // If Fullstory is not correctly configured, skip
  if (fullstoryId === null) { return }
  if (!mutation.payload) { return }

  let mutationPayload: boolean | TeamPayload | UserPayload | undefined

  switch (mutation.type) {
  // If a new Team is chosen, update user variables.
  // This action affects how the user will be presented in the FullStory dashboard,
  // but will not retroactively change user actions.
  case 'team/SET_CURRENT_TEAM':
    mutationPayload = mutation.payload as TeamPayload

    FullStory.setUserVars({
      teamId_int: mutationPayload.id,
      teamName_str: mutationPayload.name,
      teamSlug_str: mutationPayload.slug
    })
    break
  // When a User logs in, identify the user on FullStory.
  // The way the user is identify depends on the environment, as we are currently
  // using the same FullStory API Key for all environments.
  case 'user/SET_PROFILE':
    FullStory.restart()

    mutationPayload = mutation.payload as UserPayload

    FullStory.identify(`${mutationPayload.id} (${environment})`, {
      displayName: `User #${mutationPayload.id}`,
      environment_str: environment
    })
    break
  // When a User logs out, anonymize activity on FullStory.
  case 'auth/SET_AUTHENTICATED':
    if (mutation.payload === false) {
      FullStory.shutdown()
    }
    break
  }
})

const pinia = createPinia()

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  pinia,
  template: '<App/>'
})
