// CI e2e tests run from within the test container
// - the frontend is served with nginx at localhost:80
// - the backend is proxied by nginx through localhost:80/api
export default {
  baseUrl: process.env.NODE_ENV === 'CI' ? 'http://localhost:80' : 'http://localhost:8080',
  baseApiUrl: process.env.NODE_ENV === 'CI' ? 'http://localhost:80/api/' : 'http://localhost:4000/api/'
}
