import BluePill from './BluePill.vue'

const stories = {
  title: 'Common/Pill/BluePill',
  component: BluePill
}

export default stories

export const Default = () => ({
  components: { BluePill },
  template: `
    <div style="width: 70px;">
      <blue-pill>Pill</blue-pill>
    </div>
  `
})
