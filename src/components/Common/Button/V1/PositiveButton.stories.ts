import PositiveButton from './PositiveButton.vue'

export default {
  component: PositiveButton,
  title: 'Common/Button/V1/PositiveButton'
}

export const NoSlot = () => ({
  components: { PositiveButton },
  template: '<positive-button />'
})

export const Sloted = () => ({
  components: { PositiveButton },
  template: '<positive-button>My Label</positive-button>'
})

export const MediumSize = () => ({
  components: { PositiveButton },
  template: '<positive-button size="medium">My Label</positive-button>'
})

export const SmallSize = () => ({
  components: { PositiveButton },
  template: '<positive-button size="small">My Label</positive-button>'
})

export const Disabled = () => ({
  components: { PositiveButton },
  template: '<positive-button disabled>My Label</positive-button>'
})
