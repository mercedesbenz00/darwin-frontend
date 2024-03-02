import { Location } from 'vue-router'

export const buildLocation = (params: Partial<Location>): Location => ({
  name: 'Datasets',
  path: '/',
  hash: '',
  query: {},
  params: {},
  append: false,
  replace: false,
  ...params
})
