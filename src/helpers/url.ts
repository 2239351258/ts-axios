import { isDate, isPlainObject } from './util'

function encode(val: string): string {
  return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
}
/**
 * 将get请求参数拼接到url中
 * @param url get请求的url
 * @param params get请求传的参数
 * @returns 将参数拼接到url中的一个字符串
 */
export function buildURL(url: string, params?: any): string {
  // 没有传params参数直接返回url
  if (!params) return url

  const parts: string[] = []

  Object.keys(params).forEach(key => {
    const val = params[key]
    // 如果是null或undefined不进行拼接
    if (val === null || typeof val === 'undefined') return
    let values = []
    if (Array.isArray(val)) {
      values = val
      key += '[]'
    } else {
      values = [val]
    }
    values.forEach(item => {
      if (isDate(item)) {
        item = item.toISOString()
      } else if (isPlainObject(item)) {
        item = JSON.stringify(item)
      }
      parts.push(`${encode(key)}=${encode(item)}`)
    })
  })

  let serializedParams = parts.join('&')

  if (serializedParams) {
    const markIndex = url.indexOf('#')
    if (markIndex !== -1) {
      url = url.slice(0, markIndex)
    }
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
  }
  return url
}