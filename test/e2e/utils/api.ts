import axios from 'axios'
import config from '../config'

const { baseApiUrl: baseURL } = config

export const axiosInstance = () => axios.create({ baseURL })

export const sandboxAxiosInstance = (sandboxId: string) =>
  axios.create({ baseURL, headers: { 'sandbox-id': sandboxId } })

export const authedAxiosInstance = (sandboxId: string, token: string) =>
  axios.create({
    baseURL,
    headers: { 'sandbox-id': sandboxId, Authorization: `Bearer ${token}` }
  })
