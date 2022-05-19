// import Airtable from 'airtable'
import Vue from 'vue'
import Vuex from 'vuex'
import Table from '@/api/airtable.js'
Vue.use(Vuex);

const apiKey = 'YOU_API_KEY'
const baseKey = 'YOU_BASE_KEY'
const recordsTableName = 'records_test'
const savingTableName = 'saving_test'
const savingId = 'recFolhzu0j0V2ADk' // test
// const savingId = 'reca22Hd66BFUBolR'


const store = new Vuex.Store({
  state: {
    recordsTable: new Table(apiKey, baseKey, recordsTableName),
    savingTable: new Table(apiKey, baseKey, savingTableName),
    enumerationTable: new Table(apiKey, baseKey, "enumeration"),
    // 可变项
    records: [],
    chosenDay: new Date(),
    curRecord: {},
    savings: {},

    // 固定项（枚举项）
    enumeration: [],
  },
  getters: {
    dailyTotal(state) {
      console.log("records for dailyTotal:", state.records)
      let total = state.records.reduce((sum, item) => {
        return sum + (item.recordType == '支出'? -item.amount: item.amount)
      }, 0)
      console.log("total:", total)
      return total
    },
    expenseEnumeration(state) {
      return state.enumeration.filter(item => {
        return item.type == 'expense'
      })
    },
    incomeEnumeration(state) {
      return state.enumeration.filter(item => {
        return item.type == 'income'
      })
    },
    accountEnumeration(state) {
      return state.enumeration.filter(item => {
        return item.type == 'account'
      })
    },
  },
  mutations: {
    setCurRecord(state, record) {
      console.log("[store/setCurRecord]", record)
      state.curRecord = record
    },
    setChosenDay(state, date) {
      console.log("[store/setChosenDay]", date)
      state.chosenDay = date
    },
    setRecords(state, records) {
      console.log("[store/setRecords]", records)
      state.records = records
    },
    setSavings(state, savings) {
      console.log("[store/setSavings]", savings)
      state.savings = savings
    },
    insert(state, record) {
      state.recordsTable.addRecord(record).then(id => {
        record.id = id
        state.records.unshift(record)
        // 更新积蓄
        var delta = record.recordType == '支出'? (-record.amount): record.amount
        state.savings.saving += delta
        state.savings[record.accountType] += delta
        state.savingTable.updateRecord(savingId, {
          [record.accountType]: state.savings[record.accountType]
        }).catch(err => {
          console.error("update-saving err:", err)
        })
      }).catch(err => {
        console.error("insert err:", err)
      })
    },

    update(state, payload) {
      state.records = state.records.map(item => {
        if(item.id === payload.id) {
          item = {...item, ...payload.change}
        }
        return item
      })
      console.log("payLoad after:", payload)
      state.recordsTable.updateRecord(payload.id, payload.change)
        .catch(err => {
          console.error("update-record err:", err)
        })
      // 更新积蓄，逻辑待整理
      // 有待后续改版升级
      // 1. 只改金额，对应账户的金额+=delta
      // 2. 只改账户，前账户金额-=amount，后账户金额+=amount
      // 3. 都改，前账户金额-=formerAmount，后账户金额+=curAmount
      let formerAmount = payload.formerData.amount,
          formerAccountType = payload.formerData.accountType, 
          curAmount = payload.change.amount,
          curAccountType = payload.change.accountType
      // 1. 只改金额，对应账户的金额+=delta
      if(formerAmount !== curAmount && formerAccountType == curAccountType) {
        let delta = curAmount - formerAmount
        state.savings.saving += delta
        state.savings[curAccountType] += delta
        state.savingTable.updateRecord(savingId, {
          [payload.change.accountType]: state.savings[curAccountType]
        }).catch(err => {
          console.log("update-saving err:", err)
        })
      }
      // 2. 只改账户，前账户金额-=amount，后账户金额+=amount
      if(formerAmount == curAmount && formerAccountType != curAccountType){
        state.savings[formerAccountType] -= curAmount
        state.savings[curAccountType] += curAmount
        state.savingTable.updateRecord(savingId, {
          [formerAccountType]: state.savings[formerAccountType],
          [curAccountType]: state.savings[curAccountType]
        }).catch(err => {
          console.log("update-saving err:", err)
        })
      }
      // 3. 都改，前账户金额-=formerAmount，后账户金额+=curAmount
      if(formerAmount != curAmount && formerAccountType != curAccountType){
        state.savings[formerAccountType] -= formerAmount
        state.savings[curAccountType] += curAmount
        state.savingTable.updateRecord(savingId, {
          [formerAccountType]: state.savings[formerAccountType],
          [curAccountType]: state.savings[curAccountType]
        }).catch(err => {
          console.log("update-saving err:", err)
        })
      }
    },
    delete(state, ids) {
      state.records = state.records.filter(item => {
        return ids.indexOf(item.id) === -1
      })
      state.recordsTable.deleteRecord(ids)
        .then(deletedRecords => {
          deletedRecords.forEach((item) => {
            state.savings.saving -= item.amount
            state.savings[item.accountType] -= item.amount
            state.savingTable.updateRecord(savingId, {
              [item.accountType]: state.savings[item.accountType]
            }).catch(err => {
              console.error("update-saving err:", err)
            })
          })
        })
        .catch(err => {
          console.error("delete err:", err)
        })
    },
    initEnumeration(state) {
      // 初始化枚举信息
      state.enumerationTable.getRecords()
        .then(records => {
          state.enumeration = records
        })
        .catch(err => {
          console.error("get enumeration err:", err)
        })
    },
  }
})

export default store