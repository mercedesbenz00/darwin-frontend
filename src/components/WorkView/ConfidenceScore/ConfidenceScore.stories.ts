import ConfidenceScore from './ConfidenceScore.vue'

const stories = {
  title: 'Workview/ConfidenceScore/ConfidenceScore',
  argTypes: {
    score: { control: 'number' }
  }
}

export default stories

type Args = Record<keyof typeof stories.argTypes, any>

export const Interactive = (args: Args, { argTypes }: any) => ({
  props: Object.keys(argTypes),
  components: { ConfidenceScore },
  template: '<confidence-score v-bind="$props" />'
})

Interactive.args = {
  score: 50
}

export const ConfidenceScores = () => ({
  components: { ConfidenceScore },
  template: `
    <div style="width: 400px;
                display: grid;
                grid-gap: 2px;
                grid-template-columns: repeat(auto-fit, 30px);">
      <confidence-score
        v-for="index in 100"
        :key="index"
        :score="index"
      />
    </div>
  `
})
