import { Meta, Story } from '@storybook/vue'

import ListElementV2 from '@/components/Common/ListElements/ListElementV2/ListElementV2.vue'
import { ListElementV2Props } from '@/components/Common/ListElements/ListElementV2/types'

export default {
  title: 'Common/ListElements/ListElement'
} as Meta<typeof ListElementV2>

const Template: Story<ListElementV2Props> = (args, { argTypes }) => ({
  components: { ListElementV2 },
  props: Object.keys(argTypes),
  template: `
    <div style='width:220px'>
    <list-element-v2 v-bind='$props'>
      <svg width='20' height='20' viewBox='0 0 20 20' fill='none'
           xmlns='http://www.w3.org/2000/svg'
      >
        <path d='M10 3.875L17 5.625L10 7.375L3 5.625L10 3.875Z' fill='#CACCCE' stroke='#62676A'
              stroke-width='1.3125' stroke-linejoin='round'
        />
        <path
          d='M10 16.125L16.3372 14.5407C16.7267 14.4433 17 14.0933 17 13.6918V5.625L10.6628
             7.2093C10.2733 7.30669 10 7.65667 10 8.05818V16.125Z'
          fill='#CACCCE'
        />
        <path
          d='M10 16.125L16.3372 14.5407C16.7267 14.4433 17 14.0933 17
             13.6918V5.625L10.6628 7.2093C10.2733 7.30669 10 7.65667 10
             8.05818V16.125ZM10 16.125L3.66278 14.5407C3.27326 14.4433 3
             14.0933 3 13.6918V5.625'
          stroke='#62676A' stroke-width='1.3125' stroke-linejoin='round'
        />
      </svg>
      <svg width='20' height='20' viewBox='0 0 20 20' fill='none'
           xmlns='http://www.w3.org/2000/svg'
      >
        <path d='M10 3.875L17 5.625L10 7.375L3 5.625L10 3.875Z' fill='#CACCCE' stroke='#62676A'
              stroke-width='1.3125' stroke-linejoin='round'
        />
        <path
          d='M10 16.125L16.3372 14.5407C16.7267 14.4433 17 14.0933 17
             13.6918V5.625L10.6628 7.2093C10.2733 7.30669 10 7.65667 10 8.05818V16.125Z'
          fill='#CACCCE'
        />
        <path
          d='M10 16.125L16.3372 14.5407C16.7267 14.4433 17 14.0933 17
             13.6918V5.625L10.6628 7.2093C10.2733 7.30669 10 7.65667
             10 8.05818V16.125ZM10 16.125L3.66278 14.5407C3.27326
             14.4433 3 14.0933 3 13.6918V5.625'
          stroke='#62676A' stroke-width='1.3125' stroke-linejoin='round'
        />
      </svg>
      <svg width='20' height='20' viewBox='0 0 20 20' fill='none'
           xmlns='http://www.w3.org/2000/svg'
      >
        <path d='M10 3.875L17 5.625L10 7.375L3 5.625L10 3.875Z' fill='#CACCCE' stroke='#62676A'
              stroke-width='1.3125' stroke-linejoin='round'
        />
        <path
          d='M10 16.125L16.3372 14.5407C16.7267 14.4433 17 14.0933 17
             13.6918V5.625L10.6628 7.2093C10.2733 7.30669 10 7.65667
             10 8.05818V16.125Z'
          fill='#CACCCE'
        />
        <path
          d='M10 16.125L16.3372 14.5407C16.7267 14.4433 17 14.0933 17
             13.6918V5.625L10.6628 7.2093C10.2733 7.30669 10 7.65667
             10 8.05818V16.125ZM10 16.125L3.66278 14.5407C3.27326
             14.4433 3 14.0933 3 13.6918V5.625'
          stroke='#62676A' stroke-width='1.3125' stroke-linejoin='round'
        />
      </svg>
    </list-element-v2>
    </div>`
})

export const Default = Template.bind({})
Default.args = {
  text: 'List-Element',
  selected: false
}

export const Childs = Template.bind({})
Childs.args = {
  text: 'List-Element with Child',
  selected: false
}
