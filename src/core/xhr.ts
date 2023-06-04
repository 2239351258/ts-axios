import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { parseHeaders } from '../helpers/headers'
import { createError } from '../helpers/error'
import { isURLSameOrigin } from '../helpers/url'
import cookie from '../helpers/cookie'
import { isFormData } from '../helpers/util'
export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const {
      data = null,
      url,
      method = 'get',
      headers,
      responseType,
      timeout,
      cancelToken,
      withCredentials,
      csrfCookieName,
      csrfHeaderName,
      onDownloadProgress,
      onUploadProgress
    } = config
    // 创建XMLHttpRequest实例
    const request = new XMLHttpRequest()
    // 初始化
    request.open(method.toUpperCase(), url!, true)
    // 配置config对象
    configureRequest()
    // 添加事件处理函数
    addEvent()
    // 处理请求头
    processHeaders()
    // 处理请求取消功能
    processCancel()
    // 发送请求
    request.send(data)

    function configureRequest(): void {
      if (responseType) {
        request.responseType = responseType
      }

      if (timeout) {
        request.timeout = timeout
      }
      // 是否携带cookie
      if (withCredentials) {
        request.withCredentials = withCredentials
      }
    }

    function addEvent(): void {
      // 监测状态码变化
      request.onreadystatechange = function handleLoad() {
        if (request.readyState !== 4) return
        if (request.status === 0) return

        const responseHeaders = parseHeaders(request.getAllResponseHeaders())
        const responseData = responseType !== 'text' ? request.response : request.responseText
        const response: AxiosResponse = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config,
          request
        }
        handleResponse(response)
      }
      // 处理异常
      request.onerror = function handleError() {
        // reject(new Error('Network Error'))
        reject(createError('Network Error', config, null, request))
      }
      // 处理超时
      request.ontimeout = function handleTimeout() {
        reject(createError(`Timeout of ${timeout} ms exceeded`, config, 'ECONNABORTED', request))
      }

      if (onUploadProgress) {
        request.onprogress = onDownloadProgress!
      }
      if (onUploadProgress) {
        request.upload.onprogress = onUploadProgress
      }
    }

    function processHeaders(): void {
      if (isFormData(data)) {
        delete headers['Content-Type']
      }

      // csrf防御，
      if ((withCredentials || isURLSameOrigin(url!)) && csrfCookieName) {
        const csrfValue = cookie.read(csrfCookieName)
        if (csrfValue && csrfHeaderName) {
          headers[csrfHeaderName] = csrfValue
        }
      }

      // 设置请求头
      Object.keys(headers).forEach(name => {
        if (data === null && name.toLowerCase() === 'content-type') {
          delete headers[name]
        } else {
          request.setRequestHeader(name, headers[name])
        }
      })
    }

    function processCancel(): void {
      // 取消请求
      if (cancelToken) {
        cancelToken.promise.then(reason => {
          request.abort()
          reject(reason)
        })
      }
    }
    // 争对状态码的处理
    function handleResponse(response: AxiosResponse): void {
      if (response.status >= 200 && response.status < 300) {
        resolve(response)
      } else {
        reject(
          createError(
            `Request failed with status code ${response.status}`,
            config,
            null,
            request,
            response
          )
        )
      }
    }
  })
}
