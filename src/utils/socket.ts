import { Socket as PhoenixSocket, Channel as BaseChannel, Push, SocketConnectOption } from 'phoenix'

import { resolveVariable } from './config'
import { getToken } from './token'

import { session, getLocation } from '.'

// Channel definition in @types/phoenix seems to be not fully up to date, so this remedies that
export type Channel = BaseChannel & {
  joinPush: Push | undefined
  joinedOnce: boolean
  rejoin: Function
  state: 'closed' | 'errored' | 'joined' | 'joining' | 'leaving'
  topic: string
}

type SocketParams = { token: string }

type SocketType = PhoenixSocket & {
  channels: Channel[],
  params: () => SocketParams,
  onError(callback: (e: Event) => void): void;
}

/**
 * Holds global socket singleton
 *
 * A single connected socket instance is bound to a token.
 * When the token changes, the old socket needs to be disconnected and a new one created.
 * */
let socket: SocketType | null = null

interface SocketErrorData {
  errorPayload?: {}
  event?: string
  eventPayload?: {}
  topic?: string
  type: 'connect' | 'join' | 'push'
}

export class SocketError extends Error implements SocketErrorData {
  readonly name = 'SocketError'

  errorPayload?: SocketErrorData['errorPayload']
  event?: SocketErrorData['event']
  eventPayload?: SocketErrorData['eventPayload']
  topic?: SocketErrorData['topic']
  type: SocketErrorData['type']

  constructor (message: string, data: SocketErrorData) {
    super(message)

    this.errorPayload = data.errorPayload
    this.event = data.event
    this.eventPayload = data.eventPayload
    this.topic = data.topic
    this.type = data.type
  }
}

/**
 * Used to collect socket report data when reporting error to sentry
 *
 * We do this because socket cannot be JSON.stringified due to cyclic properties
 */
const collectReportData = (socket: SocketType | null, event?: Event) => ({
  channels: socket && socket.channels.map(c => ({
    topic: c.topic,
    state: c.state,
    joinedOnce: c.joinedOnce
  })),
  connectionState: socket && socket.connectionState(),
  params: socket && socket.params,
  event
})

type JoinError = { reason: string }
type JoinResponse = { channel?: Channel, error?: JoinError, timeout?: boolean }

/**
 * Resolves endpoint from window location
 *
 * The endpoint to connect to depends on several factors
 * - http (socket protocol must be ws) vs https (socket protocol must be wss)
 * - runtime environment (production vs other)
 */
const getEndPoint = (): string => {
  const baseApi = resolveVariable(process.env.VUE_APP_BASE_API, '$BASE_API') as string || ''
  const isSecure = window.location.protocol === 'https:'
  const isDevbot = baseApi.includes('devbot')
  const isStaging = baseApi.includes('staging.v7labs.com')
  const protocol = isSecure || isDevbot || isStaging ? 'wss' : 'ws'
  let host: string = 'localhost:4000'
  if (process.env.NODE_ENV === 'production') {
    host = window.location.host
  } else if (baseApi) {
    host = getLocation(baseApi).host
  }
  return `${protocol}://${host}/socket`
}

/**
 * Builds a new socket using an access token and endpoint
 */
const newSocket = (): SocketType => {
  const logger = (kind: string, msg: string, data: string) => {
    console.info(`${kind}: ${msg}`, data)
  }

  const env = process.env.NODE_ENV
  const loggedEnvs: string[] = []
  const loggerEnabled = env && loggedEnvs.includes(env)

  const params = () => ({ token: getToken() })

  const endpoint = getEndPoint()

  const args: Partial<SocketConnectOption> = { params }
  if (loggerEnabled) { args.logger = logger }

  return new PhoenixSocket(endpoint, args) as SocketType
}

/** (Re)connects with an existing socket */
const connectSocket = (socket: SocketType): void => {
  socket.onMessage(() => {
    session.maybeRefreshAccessToken()
  })

  socket.onOpen(() => console.info('socket.ts', 'socket connection open'))

  socket.onError((event: Event) => {
    session.maybeRefreshAccessToken()
    console.info('socket.ts', 'socket connection error', JSON.stringify(event))
  })

  socket.onClose((...params: any[]) =>
    console.info('socket.ts', 'socket connection close', JSON.stringify(params))
  )

  socket.connect()
}

/**
 * Resolves socket singleton by creating it, reconnecting to it,
 * or just returning a connected instance
 *
 * A socket is bound to the login token, so when the token changes,
 * the socket needs to be recreated.
 *
 * This can happen when switching users, but also when logging in again as the same user,
 * as well as when the token auto-refreshes.
 *
 * In all other cases, the same socket instance is maintained and if necessary, reconnected to.
 *
 * - connecting for the first time
 * - reconnecting
 * - just returning an already connected socket
 */
const resolveSocketSingleton = async (): Promise<void> => {
  // create new socket initially, or on token change
  if (!socket) {
    await session.maybeRefreshAccessToken()
    socket = newSocket()
  }

  // reconnect existing socket if closed
  if (['closed', 'closing'].includes(socket.connectionState())) { connectSocket(socket) }

  return new Promise((resolve, reject) => {
    // function should've initialized the socket, so if this is happening, it's a bug
    if (!socket) {
      const error = new SocketError("Couldn't resolve socket", { type: 'connect' })
      return reject(error)
    }

    // if already connected, resolve immediately
    if (socket.connectionState() === 'open') { return resolve() }

    if (socket.connectionState() === 'connecting') {
      // if connecting, resolve promise when connected
      socket.onOpen(() => resolve())
      socket.onError((event: Event) => {
        const errorMessage = 'Failed connecting to socket'
        const errorPayload = collectReportData(socket, event)
        const error = new SocketError(errorMessage, { type: 'connect', errorPayload })
        return reject(error)
      })

      return
    }

    // should not happen, if it does, there's a bug in the logic
    const errorPayload = collectReportData(socket)
    const errorMessage = 'Expected socket to be connected or connecting'
    const error = new SocketError(errorMessage, { type: 'connect', errorPayload })
    return reject(error)
  })
}

/**
 * Finds a channel by topic
 */
const findChannel = (socket: SocketType, topic: string): Channel | undefined => {
  return socket.channels.find(c => c.topic === topic)
}

/**
 * Joins the specified channel in a singleton fashion returning a promise result,
 * so it can be awaited.
 *
 * If the channel is already joined, it's simply returned.
 * If the channel is currently joning, the promise is bound to the join event.
 * If the channel is in any other state, it is rejoined.
 */
const resolveChannel = (topic: string): Promise<JoinResponse> => {
  if (!socket) {
    throw new SocketError('Socket not available. Call Socket.connect first.', {
      type: 'join',
      topic
    })
  }

  const channel = findChannel(socket, topic) || socket.channel(topic) as Channel

  if (channel.state === 'joined') { return Promise.resolve({ channel }) }
  if (channel.state !== 'joining') { channel.joinedOnce ? channel.rejoin() : channel.join() }

  const { joinPush } = channel
  if (!joinPush) {
    throw new SocketError(
      `Expected channel with state: ${channel.state} to have a join reference`,
      { type: 'join', topic: channel.topic }
    )
  }

  return new Promise((resolve) => {
    joinPush.receive('ok', () => resolve({ channel }))
      .receive('error', (error: JoinError) => { resolve({ error }) })
      .receive('timeout', () => { resolve({ timeout: true }) })
  })
}

/**
 *  Leaves specified channel
 */
const leaveChannel = (channel: Channel): Promise<{ channel: Channel | null, response: any }> => {
  return new Promise((resolve, reject) => {
    if (channel.state === 'closed') { return resolve({ channel, response: null }) }
    channel.leave()
      .receive('ok', (response) => resolve({ channel, response }))
      .receive('error', (error) => reject(error))
  })
}

export class Socket {
  /**
   * Idempotent request to join a channel matching the specified topic.
   *
   * This function will
   *
   * - create and connect to, or reconnect to a socket
   * - find an existing or create a new channel
   * - connect to the channel
   * - request an auth token refresh if it has expired
   */
  public static async connectAndJoin (topic: string): Promise<{ channel: Channel }> {
    await resolveSocketSingleton()

    const { channel, error, timeout } = await resolveChannel(topic)

    if (channel) { return { channel } }

    if (error) {
      throw new SocketError('Error joining topic', { type: 'join', errorPayload: error })
    }

    if (timeout) {
      throw new SocketError('Timed out attempting to join channel topic', { type: 'join' })
    }

    throw new SocketError('join(topic) returned unexpected response', { type: 'join' })
  }

  /**
   * Leaves the channel with the specified topic
   * @param topic Topic to match the channel on
   */
  public static async leave (topic: string) {
    if (!socket) { return }
    const channel = findChannel(socket, topic)
    if (channel) {
      await leaveChannel(channel)
    }
  }

  /** Disconnect the socket */
  public static async disconnect () {
    if (socket && socket.connectionState() !== 'closed') { await socket.disconnect() }
  }

  /** Push a message to a channel with a response formed as a promise, so it can be avaited on */
  public static pushPromise (channel: Channel, event: string, eventPayload: {}): Promise<void> {
    return new Promise((resolve, reject) => {
      channel
        .push(event, eventPayload)
        .receive('ok', resolve)
        .receive('error', (errorPayload) =>
          reject(new SocketError('Error while pushing message to channel', {
            type: 'push',
            topic: channel.topic,
            errorPayload,
            eventPayload,
            event
          }))
        )
    })
  }
}
