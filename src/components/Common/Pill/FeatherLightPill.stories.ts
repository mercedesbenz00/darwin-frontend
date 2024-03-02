import FeatherLightPill from './FeatherLightPill.vue'

const stories = {
  title: 'Common/Pill/FeatherLightPill',
  component: FeatherLightPill
}

export default stories

export const Default = () => ({
  components: { FeatherLightPill },
  template: `
    <div style="width: 70px;">
      <feather-light-pill>Pill</feather-light-pill>
    </div>
  `
})
