import Vue from 'vue'

import NegativeButton from '@/components/Common/Button/V1/NegativeButton.vue'
import PositiveButton from '@/components/Common/Button/V1/PositiveButton.vue'
import PrimaryButton from '@/components/Common/Button/V1/PrimaryButton.vue'
import SecondaryButton from '@/components/Common/Button/V1/SecondaryButton.vue'
import SecondaryLightButton from '@/components/Common/Button/V1/SecondaryLightButton.vue'

export const installCommonComponents = (_Vue: typeof Vue) => {
  _Vue.component('NegativeButton', NegativeButton)
  _Vue.component('PrimaryButton', PrimaryButton)
  _Vue.component('SecondaryButton', SecondaryButton)
  _Vue.component('SecondaryLightButton', SecondaryLightButton)
  _Vue.component('PositiveButton', PositiveButton)
}
