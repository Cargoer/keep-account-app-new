/**
 * 织信api
 * 免费版不支持使用
 */

const applicationKey = ''
const baseRequestUrl = `https://app.informat.cn/p/webapi`

function baseRequest(url, params = {}) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: baseRequestUrl + url,
      data: {
        ...params
      },
      success: (res) => {
        console.log(res)
        resolve(res)
      },
      fail: (err) => {
        console.log(err)
        uni.showToast({
          title: err.errorMessage,
          icon: 'none',
        })
        reject(err)
      },
    })
  }) 
}

export function queryTableList(params) {
  return baseRequest('/table_query', params)
}