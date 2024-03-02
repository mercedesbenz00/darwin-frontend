import { Story } from '@storybook/vue'
import { defineComponent } from 'vue'

import { IconMonoPlus } from '@/assets/icons/V2/Mono'

import DarwinButton from './DarwinButton.vue'
import ToggleButton from './ToggleButton.vue'

export default {
  title: 'UI Kit/Buttons'
}

const Group = defineComponent({
  props: { title: { type: String, required: true } },
  template: `
    <div style="display: flex; flex-direction: column; gap: 0.5em;">
      <h3 style="font-size: 20px; font-weight: bold">{{title}}</h3>
      <div
        style="
          display: grid;
          grid-template-columns: auto auto auto auto;
          row-gap: 1em;
          column-gap: 0.5em;
          justify-content: start;
          align-items: center;
        "
      >
        <slot>
      </div>
    </div>
  `
})

export const Buttons: Story = () => defineComponent({
  components: {
    DarwinButton,
    Group,
    IconMonoPlus,
    ToggleButton
  },
  template:
    `
    <div style="display: flex; flex-direction: column; gap: 2em;">
      <Group title="Regular">
        <DarwinButton kind="primary" size="xs">Primary XS</DarwinButton>
        <DarwinButton kind="primary" size="sm">Primary XS</DarwinButton>
        <DarwinButton kind="primary" size="md">Primary XS</DarwinButton>
        <DarwinButton kind="primary" size="lg">Primary XS</DarwinButton>
        <DarwinButton kind="secondary" size="xs">Secondary XS</DarwinButton>
        <DarwinButton kind="secondary" size="sm">Secondary XS</DarwinButton>
        <DarwinButton kind="secondary" size="md">Secondary XS</DarwinButton>
        <DarwinButton kind="secondary" size="lg">Secondary XS</DarwinButton>
        <DarwinButton kind="negative" size="xs">Negative XS</DarwinButton>
        <DarwinButton kind="negative" size="sm">Negative XS</DarwinButton>
        <DarwinButton kind="negative" size="md">Negative XS</DarwinButton>
        <DarwinButton kind="negative" size="lg">Negative XS</DarwinButton>
        <DarwinButton kind="outline" size="xs">Outline XS</DarwinButton>
        <DarwinButton kind="outline" size="sm">Outline XS</DarwinButton>
        <DarwinButton kind="outline" size="md">Outline XS</DarwinButton>
        <DarwinButton kind="outline" size="lg">Outline XS</DarwinButton>
      </Group>
      <Group title="Disabled">
        <DarwinButton kind="primary" size="xs" disabled>Primary XS</DarwinButton>
        <DarwinButton kind="primary" size="sm" disabled>Primary XS</DarwinButton>
        <DarwinButton kind="primary" size="md" disabled>Primary XS</DarwinButton>
        <DarwinButton kind="primary" size="lg" disabled>Primary XS</DarwinButton>
        <DarwinButton kind="secondary" size="xs" disabled>Secondary XS</DarwinButton>
        <DarwinButton kind="secondary" size="sm" disabled>Secondary XS</DarwinButton>
        <DarwinButton kind="secondary" size="md" disabled>Secondary XS</DarwinButton>
        <DarwinButton kind="secondary" size="lg" disabled>Secondary XS</DarwinButton>
        <DarwinButton kind="negative" size="xs" disabled>Negative XS</DarwinButton>
        <DarwinButton kind="negative" size="sm" disabled>Negative XS</DarwinButton>
        <DarwinButton kind="negative" size="md" disabled>Negative XS</DarwinButton>
        <DarwinButton kind="negative" size="lg" disabled>Negative XS</DarwinButton>
        <DarwinButton kind="outline" size="xs" disabled>Outline XS</DarwinButton>
        <DarwinButton kind="outline" size="sm" disabled>Outline XS</DarwinButton>
        <DarwinButton kind="outline" size="md" disabled>Outline XS</DarwinButton>
        <DarwinButton kind="outline" size="lg" disabled>Outline XS</DarwinButton>
      </Group>
      <Group title="With prefix">
        <DarwinButton kind="primary" size="xs">
          <template #prefix><IconMonoPlus /></template>
          Primary XS
        </DarwinButton>
        <DarwinButton kind="primary" size="sm">
          <template #prefix><IconMonoPlus /></template>
          Primary SM
        </DarwinButton>
        <DarwinButton kind="primary" size="md">
          <template #prefix><IconMonoPlus /></template>
          Primary MD
        </DarwinButton>
        <DarwinButton kind="primary" size="lg">
          <template #prefix><IconMonoPlus /></template>
          Primary LG
        </DarwinButton>
      </Group>
      <Group title="With sufix">
        <DarwinButton kind="primary" size="xs">
          Primary XS
          <template #sufix><IconMonoPlus /></template>
        </DarwinButton>
        <DarwinButton kind="primary" size="sm">
          Primary SM
          <template #sufix><IconMonoPlus /></template>
        </DarwinButton>
        <DarwinButton kind="primary" size="md">
          Primary MD
          <template #sufix><IconMonoPlus /></template>
        </DarwinButton>
        <DarwinButton kind="primary" size="lg">
          Primary LG
          <template #sufix><IconMonoPlus /></template>
        </DarwinButton>
      </Group>
      <Group title="With both icons">
        <DarwinButton kind="primary" size="xs">
          <template #prefix><IconMonoPlus /></template>
          Primary XS
          <template #sufix><IconMonoPlus /></template>
        </DarwinButton>
        <DarwinButton kind="primary" size="sm">
          <template #prefix><IconMonoPlus /></template>
          Primary SM
          <template #sufix><IconMonoPlus /></template>
        </DarwinButton>
        <DarwinButton kind="primary" size="md">
          <template #prefix><IconMonoPlus /></template>
          Primary MD
          <template #sufix><IconMonoPlus /></template>
        </DarwinButton>
        <DarwinButton kind="primary" size="lg">
          <template #prefix><IconMonoPlus /></template>
          Primary LG
          <template #sufix><IconMonoPlus /></template>
        </DarwinButton>
      </Group>
      <Group title="ToggleButton">
        <ToggleButton>Regular</ToggleButton>
      </Group>
    </div>
    `
})
