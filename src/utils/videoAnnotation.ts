export type RangeWithId = {
  id: string
  range: number[]
  priority?: number
}

const isNonColliding = (range1: RangeWithId, range2: RangeWithId): boolean => {
  return (range1.range[1] <= range2.range[0] || range1.range[0] >= range2.range[1])
}

/**
 * Sort ranges with range
 *  The bigger the priority is, the higher the range will locate
 */
export const sortRangeVertically = (ranges: RangeWithId[]) => {
  ranges.sort((a, b) => {
    if (a.priority && b.priority) {
      if (a.priority < b.priority) { return -1 }
      if (a.priority > b.priority) { return 1 }
    }
    if (a.priority && !b.priority) { return -1 }
    if (!a.priority && b.priority) { return -1 }

    const rangeA = a.range
    const rangeB = b.range
    if (rangeA[0] < rangeB[0]) { return -1 }
    if (rangeA[0] > rangeB[0]) { return 1 }
    if (rangeA[1] < rangeB[1]) { return -1 }
    if (rangeA[1] > rangeB[1]) { return 1 }
    return 0
  })

  const groups: RangeWithId[][] = ranges.reduce((groups: RangeWithId[][], range: RangeWithId) => {
    let i
    for (i = 0; i < groups.length; i++) {
      if (groups[i].every(groupRange => isNonColliding(groupRange, range))) {
        break
      }
    }
    if (i < groups.length) {
      groups[i].push(range)
    } else {
      groups.push([range])
    }
    return groups
  }, [])

  return {
    verticalIndexMap: groups.reduce((verticalIndexMap, group, index) => {
      for (const range of group) {
        verticalIndexMap[range.id] = index
      }
      return verticalIndexMap
    }, {} as { [key: string]: number }),
    total: groups.length
  }
}
