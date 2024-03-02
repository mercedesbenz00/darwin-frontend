import { AxiosResponse } from 'axios'
import filesize from 'filesize'

export const readFileAsData = (file: File) => {
  const reader = new FileReader()
  return new Promise<string>((resolve) => {
    reader.onload = () => { resolve(reader.result as string) }
    reader.readAsDataURL(file)
  })
}

export const readFileAsBinary = (file: File) => {
  const reader = new FileReader()
  return new Promise<string>((resolve) => {
    reader.onload = () => { resolve(reader.result as string) }
    reader.readAsBinaryString(file)
  })
}

/**
 * Returns File object from remote file
 */
export const getFileFromUrl = async (filename: string, url: string) => {
  const response = await fetch(url)
  const blob = await response.blob()
  return new File([blob], filename, { type: blob.type })
}

const inferFileName = (res: AxiosResponse<BlobPart>) => {
  const disposition = res.request.getResponseHeader('content-disposition')
  const matches = /"([^"]*)"/.exec(disposition)
  return (matches != null && matches[1] ? matches[1] : 'download.zip')
}

const inferContentType = (res: AxiosResponse<BlobPart>) =>
  res.request.getResponseHeader('content-type') || 'application/zip'

/** Triggers download of a file the contents of which have been received through an API request */
export const downloadFile = (res: AxiosResponse<BlobPart>, defaultFilename?: string): void => {
  const filename = defaultFilename || inferFileName(res)

  const blob = new Blob([res.data], { type: inferContentType(res) })
  const link = document.createElement('a')

  link.href = window.URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)

  link.click()
  document.body.removeChild(link)
}

export const formatFileSize = (bytes: number): string => {
  return filesize(bytes, { round: 1 })
}

export const getFileExtension = (fileName: string): string => {
  return fileName.split('.')[1]
}
