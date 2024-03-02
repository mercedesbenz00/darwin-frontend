import SecondaryLightButton from './SecondaryLightButton.vue'

export default {
  component: SecondaryLightButton,
  title: 'Common/Button/V1/SecondaryLightButton'
}

export const NoSlot = () => ({
  components: { SecondaryLightButton },
  template: '<secondary-light-button />'
})

export const Sloted = () => ({
  components: { SecondaryLightButton },
  template: '<secondary-light-button>My Label</secondary-light-button>'
})

export const MediumSize = () => ({
  components: { SecondaryLightButton },
  template: '<secondary-light-button size="medium">My Label</secondary-light-button>'
})

export const SmallSize = () => ({
  components: { SecondaryLightButton },
  template: '<secondary-light-button size="small">My Label</secondary-light-button>'
})

export const Disabled = () => ({
  components: { SecondaryLightButton },
  template: '<secondary-light-button disabled>My Label</secondary-light-button>'
})
