import { VueConstructor } from 'vue'

import router from '@/router'

const VueAnalytics = require('vue-analytics').default

const getGAId = () => {
  switch (window.location.host) {
  case 'darwin.v7labs.com': return 'UA-142224028-1'
  case 'staging.v7labs.com': return 'UA-142224028-2'
  default: return '-'
  }
}

const endpoints = ['darwin.v7labs.com', 'staging.v7labs.com']

export const setupGoogleAnalytics = (Vue: VueConstructor) => {
  const GA_ENABLED = endpoints.includes(window.location.host)
  const GA_DEBUG = false
  const GA_SEND_HIT_TASK = true

  if (GA_ENABLED) {
    Vue.use(VueAnalytics, {
      id: getGAId(),
      set: [
        { field: 'anonymizeIp', value: true }
      ],
      router,
      autoTracking: {
        exception: true
      },
      debug: {
        enabled: GA_DEBUG,
        sendHitTask: GA_SEND_HIT_TASK
      },
      disabled: document.cookie.indexOf('ga-optout') > -1
    })
  } else {
    Vue.prototype.$ga = {
      event () { }
    }
  }
}
