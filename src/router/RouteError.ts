import { Route } from 'vue-router'

type RouteErrorParams = {
  route: Route
  missingParams?: string[],
  missingQueryParams?: string[]
}

const composeMessage = (params: RouteErrorParams) => [
  `Error on route ${params.route.name}`,
  params.missingParams ? `missing params: ${params.missingParams.join(', ')}` : null,
  params.missingQueryParams ? `missing params: ${params.missingQueryParams.join(', ')}` : null
].filter(m => !!m).join(': ')

export default class RouteError extends Error {
  readonly name = 'RouteError'
  params: RouteErrorParams

  constructor (params: RouteErrorParams) {
    super(composeMessage(params))
    this.params = params
  }
}
