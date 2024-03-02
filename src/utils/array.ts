/**
 * Array related helper functions
 */
import { difference, intersection, sortBy } from 'lodash'

export const initializeArray = (length: number): undefined[] =>
  Array.from(new Array(length))

/**
 * * includes - attribute names to include when copying, if undefined, it will not considered
 * * excludes - attribute names to exclude when copying, if undefined, it will not considered
 */
export type COPY_ATTRIBUTE_OPTIONS = {
  includes?: string[]
  excludes?: string[]
}

export const copyAttributes = (dest: any, src: any, options: COPY_ATTRIBUTE_OPTIONS = {}) => {
  for (const key of Object.keys(src)) {
    if (options.includes && !options.includes.includes(key)) { continue }
    if (options.excludes && options.excludes.includes(key)) { continue }
    dest[key] = src[key]
  }
}

/**
 * Update the current array with the new values
 * It just does the following 3 things
 * * Removes the old values that is not existing in the new array
 * * Updates the existing object values with the new value in the new array
 * * Add new values from the new array
 * @param currentEntries Current entries to update
 * @param newEntries New entries that has updated values
 * @param idFunc Function that will determine unique id from an entry
 */
export const updateArray = (
  currentEntries: any[],
  newEntries: any[],
  idFunc: (entry: any) => unknown,
  copyOptions: COPY_ATTRIBUTE_OPTIONS = {}
) => {
  if (!currentEntries || !newEntries) { return }

  const oldIds = currentEntries.map(idFunc)
  const newIds = newEntries.map(idFunc)

  const getIdIndexMap = (entries: any[]) => entries.reduce((accu, entry, index) => {
    const id = idFunc(entry) as any
    accu[id] = index
    return accu
  }, {} as any)

  const oldIdIndexMap = getIdIndexMap(currentEntries)
  const newIdIndexMap = getIdIndexMap(newEntries)

  // Copy entry details from new to old one
  const idsToCopy = intersection(oldIds, newIds)
  idsToCopy.forEach((id: any) => {
    copyAttributes(currentEntries[oldIdIndexMap[id]], newEntries[newIdIndexMap[id]], copyOptions)
  })

  // Remove old entries that doesn't exist in the new entries
  const idsToRemove = difference(oldIds, newIds)
  idsToRemove.reverse().forEach((id: any) => currentEntries.splice(oldIdIndexMap[id], 1))

  // Add new entries from the new entries
  const idsToAdd = difference(newIds, oldIds)
  idsToAdd.forEach((id: any) => currentEntries.push(newEntries[newIdIndexMap[id]]))

  sortBy(currentEntries, entry => newIdIndexMap[idFunc(entry) as any])
}

export const parseRouteQueryToStringArray =
  (value?: string | (string | null)[]): string[] | undefined => {
    if (!value) { return undefined }

    if (value instanceof Array) {
      const strings = value.filter(item => item !== null)
      return strings.length > 0 ? strings as string[] : undefined
    }

    return value.split(',')
  }

export const parseRouteQueryToNumberArray =
  (value?: string | (string | null)[]): number[] | undefined => {
    if (!value) { return undefined }
    const stringArray = parseRouteQueryToStringArray(value)
    if (!stringArray) { return undefined }

    const numbers = stringArray.map(item => parseInt(item, 10)).filter(item => !isNaN(item))
    return numbers.length > 0 ? numbers : undefined
  }

export const parseRouteQueryToString = (value?: string | (string | null)[]): string | undefined => {
  if (value instanceof Array) {
    return value.filter(item => !!item).join(',')
  }
  return value
}

export const containSameKeys = (a: Record<string, unknown>, b: Record<string, unknown>) => {
  const aKeys = Object.keys(a).sort()
  const bKeys = Object.keys(b).sort()
  return JSON.stringify(aKeys) === JSON.stringify(bKeys)
}

export const getIdNext = (current: number, length: number, next: boolean): number => {
  return next ? (current + 1) % length : (current - 1) < 0 ? length - 1 : (current - 1)
}
