import { Story } from '@storybook/vue'
import Vue from 'vue'

import * as ColoredIcons from './Colored'
import * as DuotoneIcons from './Duotone'
import * as MonoIcons from './Mono'

import * as BaseIcons from '.'

export default {
  title: 'assets/icons'
}

type ArgTypes = {
  icons: typeof BaseIcons | typeof ColoredIcons | typeof DuotoneIcons | typeof MonoIcons
}

const GalleryTemplate: Story<ArgTypes> = (args) => Vue.extend({
  components: { ...args.icons },
  props: ['icons'],
  computed: {
    iconNames (): string[] { return Object.keys(this.icons) }
  },
  data (): Object {
    return {
      style: {
        display: 'grid',
        'grid-template-columns': 'repeat(3, auto)',
        gap: '1em',
        'align-items': 'center',
        'justify-content': 'start',
        'justify-items': 'center'
      },
      iconStyle: {
        display: 'flex',
        'flex-direction': 'row',
        'align-items': 'center',
        'justify-content': 'space-around',
        gap: '0.5em'
      }
    }
  },
  template: `
    <div :style="style">
      <div :style="iconStyle" v-for="icon of iconNames" :key="icon">
        <span>{{icon}}</span>
        <component :is="icon" />
      </div>
    </div>
  `
})

export const Base: Story<ArgTypes> = GalleryTemplate.bind({})
Base.args = { icons: BaseIcons }

export const Colored: Story<ArgTypes> = GalleryTemplate.bind({})
Colored.args = { icons: ColoredIcons }

export const Duotone: Story<ArgTypes> = GalleryTemplate.bind({})
Duotone.args = { icons: DuotoneIcons }

export const Mono: Story<ArgTypes> = GalleryTemplate.bind({})
Mono.args = { icons: MonoIcons }
