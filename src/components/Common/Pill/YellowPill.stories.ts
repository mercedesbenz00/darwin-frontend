import YellowPill from './YellowPill.vue'

const stories = {
  title: 'Common/Pill/YellowPill',
  component: YellowPill
}

export default stories

export const Default = () => ({
  components: { YellowPill },
  template: `
    <div style="width: 70px;">
      <yellow-pill>Pill</yellow-pill>
    </div>
  `
})
