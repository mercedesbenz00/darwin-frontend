import Table from './Table.vue'

const stories = {
  title: 'Common/Table/V1',
  component: Table,
  argTypes: {
    filterable: { control: 'boolean' },
    noHeaders: { control: 'boolean' },
    pagination: { control: 'boolean' },
    hover: { control: 'boolean' },
    striped: { control: 'boolean' },
    cursorPointer: { control: 'boolean' },
    data: { control: 'object' },
    columns: { control: 'object' }
  }
}

export default stories

type Args = Record<keyof typeof stories.argTypes, any>

const defaultArgs: Args = {
  filterable: false,
  noHeaders: false,
  pagination: false,
  hover: false,
  striped: false,
  cursorPointer: false,
  columns: ['id', 'name'],
  data: [
    { id: 1, name: 'User name 1' },
    { id: 2, name: 'User name 2' },
    { id: 3, name: 'User name 3' },
    { id: 4, name: 'User name 4' },
    { id: 5, name: 'User name 5' }
  ]
}

export const Interactive = (args: Args, { argTypes }: any) => ({
  props: Object.keys(argTypes),
  components: { 'v-table': Table },
  template: `
    <v-table
      v-bind="$props"
    />
  `
})

Interactive.args = defaultArgs

export const WithColumnsAsObject = (args: Args, { argTypes }: any) => ({
  props: Object.keys(argTypes),
  components: { 'v-table': Table },
  template: `
    <v-table
      v-bind="$props"
    />
  `
})

WithColumnsAsObject.args = {
  ...defaultArgs,
  columns: [
    { key: 'id', class: 'id-column-class' },
    { key: 'name', class: 'name-column-class' }
  ]
}

export const WithColumnsTemplate = (args: Args, { argTypes }: any) => ({
  props: Object.keys(argTypes),
  components: { 'v-table': Table },
  template: `
    <v-table
      v-bind="$props"
    >
      <template #name="{ row }">Hello, {{ row.name }}</template>
    </v-table>
  `
})

WithColumnsTemplate.args = defaultArgs
