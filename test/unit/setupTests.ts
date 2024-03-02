// needed by jest to support generator functions
import 'regenerator-runtime/runtime'

import { format } from 'util'

import axios from 'axios'
import flushPromises from 'flush-promises'
import 'jest-canvas-mock'
import Vue from 'vue'

Vue.config.productionTip = false
Vue.config.devtools = false

process.env.VUE_APP_BASE_API = 'https://darwin.v7labs.com/api'
process.env.VUE_APP_WIND_API = 'https://darwin.v7labs.com/ai'
process.env.VUE_APP_GOOGLE_SSO_CLIENT_ID = 'sso-client-id'

axios.defaults.adapter = require('axios/lib/adapters/http')

console.info = jest.fn()
console.warn = jest.fn()

afterEach(async function () {
  await flushPromises()
})

const error = console.error

console.error = function (...args: any[]) {
  error(...args)
  const [msg, ...rest] = args
  throw new Error(format(msg, ...rest))
}

const crypto = require('crypto')

Object.defineProperty(global.self, 'crypto', {
  value: {
    getRandomValues: (arr: []) => crypto.randomBytes(arr.length)
  }
})

jest.mock('lodash/debounce', () => ({
  default: jest.fn(fn => fn),
  __esModule: true
}))

jest.mock('lodash/throttle', () => ({
  default: jest.fn(fn => fn),
  __esModule: true
}))
