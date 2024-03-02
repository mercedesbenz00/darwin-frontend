import StageTemplate from './StageTemplate.vue'

export default {
  component: StageTemplate,
  title: 'DatasetSettings/StageTemplate'
}

export const JustBody = () => ({
  components: { StageTemplate },
  template:
    `<stage-template>
      <template #body>Body</template>
    </stage-template>`
})

export const HeaderBodyAndFooter = () => ({
  components: { StageTemplate },
  template:
    `<stage-template>
      <template #header>Header</template>
      <template #body>Body</template>
      <template #footer>Footer</template>
    </stage-template>`
})

export const BodyAndFooter = () => ({
  components: { StageTemplate },
  template:
    `<stage-template>
      <template #body>Body</template>
      <template #footer>Footer</template>
    </stage-template>`
})

export const HeaderAndBody = () => ({
  components: { StageTemplate },
  template:
    `<stage-template>
      <template #header>Header</template>
      <template #body>Body</template>
    </stage-template>`
})
