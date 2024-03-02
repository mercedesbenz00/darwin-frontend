import PinkPill from './PinkPill.vue'

const stories = {
  title: 'Common/Pill/PinkPill',
  component: PinkPill
}

export default stories

export const Default = () => ({
  components: { PinkPill },
  template: `
    <div style="width: 70px;">
      <pink-pill>Pill</pink-pill>
    </div>
  `
})
