import { Meta, Story } from '@storybook/vue'

import AttributeStack from '@/components/Common/AttributeStack/AttributeStack.vue'

export default {
  title: 'Common/AttributeStack'
} as Meta<typeof AttributeStack>

export const Default: Story = (args, { argTypes }) => ({
  components: { AttributeStack },
  props: Object.keys(argTypes),
  template: `
    <div
      style='
        display: grid;
        grid-gap: 12px;
        grid-template-columns: repeat(2, 70px)
      '
    >
    <attribute-stack />
    <attribute-stack v-bind='$props'>
      <template #primary-attribute>342</template>
      <template #secondary-attribute>Files</template>
    </attribute-stack>
    <attribute-stack v-bind='$props'>
      <template #primary-attribute>12</template>
      <template #secondary-attribute>Classes</template>
    </attribute-stack>
    <attribute-stack v-bind='$props'>
      <template #primary-attribute>12</template>
      <template #secondary-attribute>Annotations</template>
    </attribute-stack>
    </div>
  `
})
