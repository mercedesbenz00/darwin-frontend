// needed by jest to support generator functions
import 'regenerator-runtime/runtime'

import axios from 'axios'
import flushPromises from 'flush-promises'
import 'jest-canvas-mock'
import Vue from 'vue'

Vue.config.productionTip = false
Vue.config.devtools = false

process.env.VUE_APP_BASE_API = 'https://darwin.v7labs.com/api'
process.env.VUE_APP_WIND_API = 'https://darwin.v7labs.com/ai'

axios.defaults.adapter = require('axios/lib/adapters/http')

afterEach(async function () {
  await flushPromises()
})

const crypto = require('crypto')

Object.defineProperty(global.self, 'crypto', {
  value: {
    getRandomValues: (arr: []) => crypto.randomBytes(arr.length)
  }
})
