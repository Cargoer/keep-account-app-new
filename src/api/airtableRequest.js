/**
 * 试图通过直接请求接口的方式来调用airtable的操作
 * 结论：此路不通
 * 1. 获取表格记录可以模拟出包请求，但是报422错误（已解决）
 * 2. 其他操作暂不明具体请求细节
 * 具体细节：
 * 1. 获取表格记录：https://api.airtable.com/v0/{baseKey}/{tableName}?view=xxx&filterByFormula=xxx
 * 2. 检索表格记录：https://api.airtable.com/v0/{baseKey}/{tableName}/{recordId}
 * 3. 添加表格记录(POST/json)：https://api.airtable.com/v0/{baseKey}/{tableName}  data: records(Array<object{fields}>)
 * 4. 更新表格记录(PATCH/PUT/json)：https://api.airtable.com/v0/{baseKey}/{tableName}  data: records(Array<object{id, fields}>)
 * 5. 删除表格记录：不详
 */

const apiKey = ''
const baseKey = ''
const baseRequestUrl = `https://api.airtable.com/v0/`

function baseRequest(url, params = {}, method = 'GET', options = {}) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: baseRequestUrl + baseKey + url,
      data: {
        ...params
      },
      method,
      header: {
        authorization: `Bearer ${apiKey}`,
        ...options
      },
      success: (res) => {
        resolve(res.data)
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

// 获取表记录
export function getTableRecords(tableName, filterByFormula = '') {
  console.log("getTableRecords!")
  return baseRequest(`/${tableName}`, {
    view: 'Grid view',
    filterByFormula 
  })
}

// 添加表记录
export function addRecord(tableName, fields) {
  console.log("addRecord worked!")
  return baseRequest(
    `/${tableName}`,
    {
      records: [{fields}]
    },
    'POST',
    {
      'Content-Type': 'application/json'
    }
  )
}

// 更改表记录
export function updateRecord(tableName, id, fields) {
  console.log("addRecord worked!")
  return baseRequest(
    `/${tableName}`,
    {
      records: [{
        id,
        fields
      }]
    },
    'PUT',
    {
      'Content-Type': 'application/json'
    }
  )
}