export const pluralize = (
  count: number,
  singular: string,
  plural: string,
  withCount: boolean = true
): string => {
  if (withCount) {
    return count === 1 ? `${count} ${singular}` : `${count} ${plural}`
  }

  return count === 1 ? `${singular}` : `${plural}`
}
