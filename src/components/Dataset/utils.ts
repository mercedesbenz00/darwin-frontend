import { pluralize } from '@/utils'

export const getBlockedFilesMessage = (blockedFileNames: string[]): string => {
  let strFileNames: string = ''
  const len: number = blockedFileNames.length

  if (len > 5) {
    strFileNames = blockedFileNames.slice(0, 5).join(', ')
    return `Ignoring already uploaded files: ${strFileNames} and ${
      len - 5
    } more ${pluralize(len - 5, 'file', 'files', false)}`
  } else {
    strFileNames = blockedFileNames.join(', ')
    return `Ignoring already uploaded ${pluralize(
      len,
      'file',
      'files',
      false
    )}: ${strFileNames}`
  }
}
