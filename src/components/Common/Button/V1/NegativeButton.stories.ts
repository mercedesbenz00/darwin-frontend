import NegativeButton from './NegativeButton.vue'

export default {
  component: NegativeButton,
  title: 'Common/Button/V1/NegativeButton'
}

export const NoSlot = () => ({
  components: { NegativeButton },
  template: '<negative-button />'
})

export const Sloted = () => ({
  components: { NegativeButton },
  template: '<negative-button>My Label</negative-button>'
})

export const MediumSize = () => ({
  components: { NegativeButton },
  template: '<negative-button size="medium">My Label</negative-button>'
})

export const SmallSize = () => ({
  components: { NegativeButton },
  template: '<negative-button size="small">My Label</negative-button>'
})

export const Disabled = () => ({
  components: { NegativeButton },
  template: '<negative-button disabled>My Label</negative-button>'
})
