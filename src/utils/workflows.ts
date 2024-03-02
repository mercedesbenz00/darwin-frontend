import { StageData } from '@/components/WorkView/TopBar/Stages/types'
import {
  StageType,
  V2ConsensusStagePayload,
  V2WorkflowEdgePayload,
  V2WorkflowStagePayload
} from '@/store/types'

/**
 * The time an auto-complete stage takes to auto-complete, as shown to users. Less than the actual
 * time, to account for latency, etc.
 */
export const AUTO_COMPLETE_USER_TIME_MS = 5000

/**
 * The time an auto-complete stage actually takes to auto-complete on the backend
 */
export const AUTO_COMPLETE_ACTUAL_TIME_MS = AUTO_COMPLETE_USER_TIME_MS + 1000

/**
 * A list of edge names for currently "supported" stages which represent following
 * the happy path of a workflow.
 */
const HAPPY_PATH_EDGES = ['accepted', 'approve', 'pass', 'default', 'succeeded']
/**
 * A list of edge names for currently "supported" stages which represent following
 * the sad path of a workflow.
 */
const SAD_PATH_EDGES = ['rejected', 'reject', 'fail', 'failed']

/**
 * Returns only the default edges of a stage.
 *
 * Ensures a single path through the workflow and no loops.
 *
 * This is temporary until we can show a branching timeline in the top bar (CYCLE 2+)
 */
export const getHappyPathEdges = (stage: V2WorkflowStagePayload): V2WorkflowEdgePayload[] =>
  stage.edges.filter(e => HAPPY_PATH_EDGES.includes(e.name))

export const getSadPathEdges = (stage: V2WorkflowStagePayload): V2WorkflowEdgePayload[] =>
  stage.edges.filter(e => SAD_PATH_EDGES.includes(e.name))

/**
 * This method will recursively cross all stages following both
 * happy (eg: succeeded) and sad (eg: failed) paths
 * @param stages all available stages from the store
 * @param current the stage that currently being visited
 * @param visited a Set with the keys of already visited nodes,
 * used to avoid ending in an infinite loop
 * @param acc an accumulator array that wil be used to return
 * the final result
 * @returns V2WorkflowStagePayload[]
 */
export const getStagesPath = (
  stages: V2WorkflowStagePayload[],
  current = stages.find(s => 'initial' in s.config && s.config.initial),
  visited = current ? new Set([current.id]) : new Set(),
  acc = current ? [current] : []
): V2WorkflowStagePayload[] => {
  if (!current) { return acc }

  const followerIds =
    current.edges.filter(e => {
      const notVisited = !visited.has(e.target_stage_id)
      if (notVisited) { visited.add(e.target_stage_id) }
      return notVisited
    })
      .map(e => e.target_stage_id)

  const followingStages = stages.filter(s => followerIds.includes(s.id))

  acc.push(...followingStages)
  followingStages.forEach(s => {
    return getStagesPath(stages, s, visited, acc)
  })
  return acc
}

export const dropConsensusInternalStages = (
  stages: V2WorkflowStagePayload[]
): V2WorkflowStagePayload[] => {
  const subStagesIds = new Set(
    stages
      .filter(
        (stage): stage is V2ConsensusStagePayload =>
          stage.type === StageType.ConsensusEntrypoint
      )
      .flatMap((cs) => [
        cs.config.test_stage_id,
        ...cs.config.parallel_stage_ids,
      ]) ?? []
  )
  return stages.filter((s) => !subStagesIds.has(s.id))
}

export const dropConsensusInternalStagesData = (
  stages: StageData[]
): StageData[] => {
  const subStagesIds = new Set(
    stages
      .map(sd => sd.stage)
      .filter(
        (stage): stage is V2ConsensusStagePayload =>
          stage.type === StageType.ConsensusEntrypoint
      )
      .flatMap((cs) => [
        cs.config.test_stage_id,
        ...cs.config.parallel_stage_ids,
      ]) ?? []
  )
  return stages.filter((sd) => !subStagesIds.has(sd.stage.id))
}

export const getOtherStages = (stages: V2WorkflowStagePayload[]): V2WorkflowStagePayload[] =>
  stages.filter(s => s.type === StageType.Discard)

/**
 * This method will recursively cross all stages following both
 * happy (eg: succeeded) and sad (eg: failed) paths
 * @param stages all available stages from the store
 * @param current the stage that currently being visited
 * @param visitedIds a Set with the keys of already visited nodes,
 * used to avoid ending in an infinite loop
 * @param acc an accumulator array that wil be used to return
 * the final result
 * @returns StageData[]
 */
export const getStagesData = (
  stages: V2WorkflowStagePayload[],
  current: StageData,
  visitedIds = current ? new Set([current.key]) : new Set(),
  acc: StageData[] = current ? [current] : []
): StageData[] => {
  if (!current) { return acc }

  const currentData = stages
    .find((s: V2WorkflowStagePayload) => s.id === current.key.split('_')[0])
  if (!currentData) { return acc }

  const followerIds = currentData.edges
    .filter((e: V2WorkflowEdgePayload) => {
      const visited = visitedIds.has(e.target_stage_id)
      if (!visited) { visitedIds.add(e.target_stage_id) }
      return !visited
    })
    .map(e => e.target_stage_id)

  // no point continuing
  if (followerIds.length === 0) { return acc }

  const followingStageData = stages
    .filter((s: V2WorkflowStagePayload) => followerIds.includes(s.id))
    .map((s: V2WorkflowStagePayload) => {
      return {
        stage: s,
        instance: null,
        followers: [],
        key: s.id
      } as StageData
    })
  acc.push(...followingStageData)
  followingStageData.forEach((sd: StageData) => {
    if (sd) { return getStagesData(stages, sd, visitedIds, acc) }
  })
  return acc
}

/**
 * Unflatten a recurisve StageData object
 * @param stages the object to be unflattened
 * @param acc an accumulator array that wil be used to return
 * the final result
 * @returns StageData[]
 */
export const collectFlattenedStageData = (
  stages: StageData[],
  acc: StageData[]
): StageData[] => {
  stages.forEach((sd: StageData) => {
    acc.push(sd)
    if (sd.followers) { collectFlattenedStageData(sd.followers, acc) }
  })
  return acc
}
