import Vue from 'vue'
import Vuex from 'vuex'
import { 
  getTableRecords, 
  addRecord, 
  updateRecord 
} from '@/api/airtableRequest.js'
import table from '@/utils/globalConfig.js'

Vue.use(Vuex);

const getTotalCondition = ({date1, date2, recordType1, recordType2}) => {
  let condition = recordType1 === recordType2
  if(date1 && date2) condition = condition && (date1 === date2)
  return condition
}

const store = new Vuex.Store({
  state: {
    // 可变项
    records: [],
    chosenDay: new Date(),
    curRecord: {},
    savings: {},
    isSecret: false,

    // 月份记录
    monthRecords: [],
    // dailyRecords: [],

    // 固定项（枚举项）
    enumeration: [],
  },
  getters: {
    dailyRecords(state) {
      return state.monthRecords.filter(item => {
        return item.createTime === state.chosenDay
      })
    },
    dailyExpenseTotal(state, getters) {
      return getters.dailyRecords.filter(item => {
        return item.recordType === '支出'
      }).reduce((total, item) => {
        return total + item.amount
      }, 0)
    },
    dailyIncomeTotal(state) {
      return getters.dailyRecords.filter(item => {
        return item.recordType === '收入'
      }).reduce((total, item) => {
        return total + item.amount
      }, 0)
    },
    monthExpenseTotal(state) {
      return state.monthRecords.filter(item => {
        return item.recordType === '支出'
      }).reduce((total, item) => {
        return total + item.amount
      }, 0)
    },
    monthIncomeTotal(state) {
      return state.monthRecords.filter(item => {
        return item.recordType === '收入'
      }).reduce((total, item) => {
        return total + item.amount
      }, 0)
    },

    // 各枚举项
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
    setMonthRecords(state, records) {
      console.log("[store/setMonthRecords]", records)
      state.records = records
    },
    setSavings(state, savings) {
      console.log("[store/setSavings]", savings)
      state.savings = savings
    },
    toggleIsSecret(state) {
      state.isSecret = !state.isSecret
    },
    insert(state, record) {
      addRecord(table.recordsTable, record).then(res => {
        let record = res.data.records[0]
        let {id, fields} = record
        updateRecord(table.recordsTable, id, {id, ...fields})
        record.id = id
        state.records.unshift(record)

        // 更新积蓄
        var delta = record.recordType == '支出'? (-record.amount): record.amount
        /** 判断账户类型
         * 1. 微信（余额大于支出，直接扣除，否则要加上cmb的扣除）
         * 2. 支付宝（同微信）
         * 3. cmb正常扣除
         * 4. 现金正常扣除
         * 5. abc正常扣除
         * 6. 若上述规则余额均不足，驳回并警告
         */
        state.savings.saving += delta
        state.savings[record.accountType] += delta
        updateRecord(table.savingTable, table.savingTableId, {
          id: table.savingTableId,
          ...state.savings,
        })
        // state.savingTable.updateRecord(savingId, {
        //   [record.accountType]: state.savings[record.accountType]
        // }).catch(err => {
        //   console.error("update-saving err:", err)
        // })
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
      updateRecord(table.recordsTable, payload.id, payload.change)
        .catch(err => {
          console.error("update-record err:", err)
        })
      // 更新积蓄，逻辑待整理
      // 有待后续改版升级
      // 1. 只改金额，对应账户的金额+=delta
      // 2. 只改账户，前账户金额-=amount，后账户金额+=amount
      // 3. 都改，前账户金额-=formerAmount，后账户金额+=curAmount
      // let formerAmount = payload.formerData.amount,
      //     formerAccountType = payload.formerData.accountType, 
      //     curAmount = payload.change.amount,
      //     curAccountType = payload.change.accountType
      // // 1. 只改金额，对应账户的金额+=delta
      // if(formerAmount !== curAmount && formerAccountType == curAccountType) {
      //   let delta = curAmount - formerAmount
      //   state.savings.saving += delta
      //   state.savings[curAccountType] += delta
      //   state.savingTable.updateRecord(savingId, {
      //     [payload.change.accountType]: state.savings[curAccountType]
      //   }).catch(err => {
      //     console.log("update-saving err:", err)
      //   })
      // }
      // // 2. 只改账户，前账户金额-=amount，后账户金额+=amount
      // if(formerAmount == curAmount && formerAccountType != curAccountType){
      //   state.savings[formerAccountType] -= curAmount
      //   state.savings[curAccountType] += curAmount
      //   state.savingTable.updateRecord(savingId, {
      //     [formerAccountType]: state.savings[formerAccountType],
      //     [curAccountType]: state.savings[curAccountType]
      //   }).catch(err => {
      //     console.log("update-saving err:", err)
      //   })
      // }
      // // 3. 都改，前账户金额-=formerAmount，后账户金额+=curAmount
      // if(formerAmount != curAmount && formerAccountType != curAccountType){
      //   state.savings[formerAccountType] -= formerAmount
      //   state.savings[curAccountType] += curAmount
      //   state.savingTable.updateRecord(savingId, {
      //     [formerAccountType]: state.savings[formerAccountType],
      //     [curAccountType]: state.savings[curAccountType]
      //   }).catch(err => {
      //     console.log("update-saving err:", err)
      //   })
      // }
    },
    delete(state, ids) {
      
    },
    initEnumeration(state) {
      // 初始化枚举信息
      getTableRecords(table.enumTable)
        .then(res => {
          state.enumeration = res.records.map(item => item.fields)
        })
        .catch(err => {
          console.error("get enumeration err:", err)
        })
    },
  }
})

export default store