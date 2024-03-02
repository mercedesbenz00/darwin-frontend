import { Dictionary, Route } from 'vue-router/types/router'

import { MembershipPayload } from '@/store/types/MembershipPayload'
import { getFullName } from '@/utils'

export const DEVELOPMENT_WORKFLOW_ID = 'DEVELOPMENT_WORKFLOW_XYZ'

export const searchByNameV2 = (
  selection: MembershipPayload[],
  search: string
): MembershipPayload[] => selection
  .filter((d) => getFullName(d).match(new RegExp(search, 'ig')))
  .sort((a, b) => getFullName(a).localeCompare(getFullName(b)))

/**
 * Unfortunately I can't find a way to mock the $route.params for storybook. This is a solution
 * which is not 100% complete but works for now. I am open for discussion and change requests
 * */
export const getRouteParams = (route?: Route) => {
  const routerParams = route?.params
  const isStorybook = (process?.env?.STORYBOOK && process.env.STORYBOOK === 'true') || !routerParams

  const params: Dictionary<string> = {
    workflowId: isStorybook ? DEVELOPMENT_WORKFLOW_ID : routerParams.workflowId,
    ...routerParams
  }

  return params
}
