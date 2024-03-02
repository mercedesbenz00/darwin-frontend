import { api } from '@/utils'

type SignParams = { signingURL: string | null }

/**
 * Sign specified file, so it can be uploaded to S3.
 *
 * Dispatches a request to backend.
 * Returns a payload containing
 * - signed S3 URL to upload to
 * - object containing signature information.
 *
 * The backend singing endpoint varies by file type/ownership, so it needs to be specified.
 *
 * @param {File} file
 * @param {String} options.signingURL Backend URL to request signing from.
 */
export const signFile = async (file: File, options: SignParams): Promise<{
  uploadUrl: string
}> => {
  const { signingURL } = options
  const payload = { filePath: file.name, contentType: file.type }
  if (!signingURL) { throw new Error('Cannot sign file. No signing URL specified.') }
  const { data } = await api.get(signingURL, payload)
  return { uploadUrl: data.upload_url }
}

type ProgressCallback = (sentBytes: number, totalBytes: number) => void
type SendParams = {
  uploadUrl: string,
  onProgress: ProgressCallback
 }

type SendResponse = { message: string, success: boolean }
type Result = (a: SendResponse) => void

const resolveResponse = (
  request: XMLHttpRequest,
  resolve: Result,
  reject: Result
): void => {
  const response = (new DOMParser()).parseFromString(request.response, 'text/xml')
  const messageContainer = response && response.firstElementChild && response.children[0]
  if (!messageContainer) { return reject({ success: false, message: 'Invalid response' }) }

  const message = messageContainer.innerHTML
  const success = request.status === 201

  return resolve({ success, message })
}

/**
 * Send a file to url
 * @param {File} file File to send
 * @param {Object} options.uploadUrl Object containing upload url information
 * @param {ProgressCallback} options.onProgress Optional callback for upload progress updates
 */
export const sendFile = (file: File, options: SendParams) => {
  const { uploadUrl, onProgress } = options
  const MAX_HANGOUT_TIME = 30000 // 30 seconds

  if (!uploadUrl) { throw new Error('Cannot send file. No upload URL specified.') }

  return new Promise((resolve, reject) => {
    // fetch doesn't support proper upload progress yet
    // so we need to use XMLHttpRequest
    const request = new XMLHttpRequest()
    request.open('PUT', uploadUrl)

    let sentAmount: number = 0
    let lastCheckedAmount: number = 0
    const checkTimer = setInterval(() => {
      if (sentAmount === lastCheckedAmount) {
        clearInterval(checkTimer)
        reject(new Error(`${file.name} uploading timed out`))
      } else {
        lastCheckedAmount = sentAmount
      }
    }, MAX_HANGOUT_TIME)

    // request finished event
    request.onload = (): void => {
      clearInterval(checkTimer)
      resolveResponse(request, resolve, reject)
    }
    // request error event
    request.onerror = (): void => {
      clearInterval(checkTimer)
      resolveResponse(request, resolve, reject)
    }
    // upload progress event
    request.upload.onprogress = (e): void => {
      sentAmount = e.loaded
      onProgress && onProgress(e.loaded, e.total)
    }

    // send PUT request to server with attached file
    request.send(file)
  })
}
