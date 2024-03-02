import SecondaryButton from './SecondaryButton.vue'

export default {
  component: SecondaryButton,
  title: 'Common/Button/V1/SecondaryButton'
}

export const NoSlot = () => ({
  components: { SecondaryButton },
  template: '<secondary-button />'
})

export const Sloted = () => ({
  components: { SecondaryButton },
  template: '<secondary-button>My Label</secondary-button>'
})

export const MediumSize = () => ({
  components: { SecondaryButton },
  template: '<secondary-button size="medium">My Label</secondary-button>'
})

export const SmallSize = () => ({
  components: { SecondaryButton },
  template: '<secondary-button size="small">My Label</secondary-button>'
})

export const Disabled = () => ({
  components: { SecondaryButton },
  template: '<secondary-button disabled>My Label</secondary-button>'
})
