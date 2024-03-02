import {
  mount,
  shallowMount,
  createLocalVue as originCreateLocalVue,
  Wrapper
} from '@vue/test-utils'
import VTooltip from 'v-tooltip'
import VModal from 'vue-js-modal'
import VueRouter from 'vue-router'
import VueToast from 'vue-toasted'
import VueVirtualScroller from 'vue-virtual-scroller'
import Vuex from 'vuex'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import { installCommonComponents } from '@/plugins/components'
import Theme from '@/plugins/theme'

export {
  mount,
  shallowMount,
  Wrapper
}

export function createLocalVue (): ReturnType<typeof originCreateLocalVue> {
  const localVue = originCreateLocalVue()
  installCommonComponents(localVue)

  /**
   * Config from main.ts file
   */
  localVue.use(Vuex)
  localVue.use(VModal, { dynamic: true })
  localVue.use(Theme)
  localVue.use(VueRouter)
  localVue.use(VueVirtualScroller)
  localVue.use(
    VTooltip,
    {
      defaultHtml: true,
      defaultBoundariesElement: document.body,
      defaultDelay: 500
    }
  )
  localVue.use(VueToast, {
    position: 'bottom-center',
    duration: 550,
    iconPack: 'fontawesome',
    closeOnSwipe: false,
    theme: 'bubble'
  })
  localVue.directive('input-auto-blur', stubDirectiveWithAttribute)
  localVue.directive('loading', stubDirectiveWithAttribute)
  localVue.directive('click-outside', stubDirectiveWithAttribute)
  localVue.directive('lazy', stubDirectiveWithAttribute)

  return localVue
}
