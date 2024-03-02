import PurplePill from './PurplePill.vue'

const stories = {
  title: 'Common/Pill/PurplePill',
  component: PurplePill
}

export default stories

export const Default = () => ({
  components: { PurplePill },
  template: `
    <div style="width: 70px;">
      <purple-pill>Pill</purple-pill>
    </div>
  `
})
