import PillBase from './PillBase.vue'

const stories = {
  title: 'Common/Pill/PillBase',
  component: PillBase
}

export default stories

export const Default = () => ({
  components: { PillBase },
  template: `
    <div style="width: 70px;">
      <pill-base>Pill</pill-base>
    </div>
  `
})
