import { ACCESS_TOKEN_COOKIE_NAME } from '@/constants'
import { getCookie, setCookie } from '@/utils/helpers/auth'
import mixpanel from '@/utils/mixpanel'
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
} from 'axios'
import { queryClient } from '@/query-client'

declare module 'axios' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any
  interface AxiosResponse<T = any> extends Promise<T> {}
}

class HTTPService {
  public instance: AxiosInstance

  public constructor(
    baseURL: string = import.meta.env.VITE_API_BASE_URL || ''
  ) {
    this.instance = axios.create({
      baseURL,
      timeout: 1000 * 60 * 5,
      withCredentials: true,
    })

    this.initializeRequestInterceptor()
    this.initializeResponseInterceptor()
  }

  private initializeRequestInterceptor() {
    this.instance.interceptors.request.use(config => {
      const token = getCookie(ACCESS_TOKEN_COOKIE_NAME)

      if (token.length) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    }, this.handleError)
  }

  private initializeResponseInterceptor() {
    this.instance.interceptors.response.use(
      this.handleResponse,
      this.handleError
    )
  }

  private handleResponse = (data: AxiosResponse) => data.data

  private handleError = async (error: AxiosError) => {
    const isUnAuthenticated = error.response?.status === 401
    if (isUnAuthenticated && window.location.pathname !== '/') {
      mixpanel.reset()
      setCookie(ACCESS_TOKEN_COOKIE_NAME, '', new Date(0))
      queryClient.clear()
      window.location.href = '/'
      return
    }
    return Promise.reject(error)
  }
}

export default HTTPService
