import PrimaryButton from './PrimaryButton.vue'

export default {
  component: PrimaryButton,
  title: 'Common/Button/V1/PrimaryButton'
}

export const NoSlot = () => ({
  components: { PrimaryButton },
  template: '<primary-button />'
})

export const Sloted = () => ({
  components: { PrimaryButton },
  template: '<primary-button>My Label</primary-button>'
})

export const MediumSize = () => ({
  components: { PrimaryButton },
  template: '<primary-button size="medium">My Label</primary-button>'
})

export const SmallSize = () => ({
  components: { PrimaryButton },
  template: '<primary-button size="small">My Label</primary-button>'
})

export const Disabled = () => ({
  components: { PrimaryButton },
  template: '<primary-button disabled>My Label</primary-button>'
})
