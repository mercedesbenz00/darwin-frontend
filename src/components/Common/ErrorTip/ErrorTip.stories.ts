import ErrorTip from './ErrorTip.vue'

export default {
  component: ErrorTip,
  title: 'Common/ErrorTip'
}

export const NoSlot = () => ({
  components: { ErrorTip },
  template: '<error-tip />'
})

export const Sloted = () => ({
  components: { ErrorTip },
  template: '<error-tip>Error Message</error-tip>'
})
