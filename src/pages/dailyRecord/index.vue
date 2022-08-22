<template>
  <view class="daily-records" @touchstart="handleTouchStart" @touchmove="handleTouchMove">
    <view class="top fr">
      <uni-icons type="left" size="24" color="#ccc" @click="shiftDay(-1)"></uni-icons>
      <uni-datetime-picker
        type="date"
        class="date-picker"
        :value="dateValue"
        @change="onSelectDate"
      ></uni-datetime-picker>
      <uni-icons type="right" size="24" color="#ccc" @click="shiftDay(1)"></uni-icons>
      <view class="date-picker today" @click="toToday">今天</view>
      <!-- TODO 放在下面正中间 -->
      <view class="add" @click="toAdd">+</view>
    </view>
    
    <view class="month-progress fr">
      <span class="txt">本月进度  </span>
      <view class="progress-bar">
        <view class="progress-fill" :style="progressWidth"></view>
      </view>
    </view>
    <view class="summary">
      <view class="summary-box fc">
        <label class="summary-text">今日收支</label>
        <view class="daily-total" v-if="!isSecret">￥{{dailyTotal.toFixed(2)}}</view>
        <view class="daily-total" v-else>*****</view>
      </view>
      <view class="vertical-line"></view>
      <view class="summary-box fc">
        <label class="summary-text">剩余积蓄</label>
        <view class="remain-saving" v-if="!isSecret">￥{{savings.saving.toFixed(2)}}</view>
        <view class="remain-saving" v-else>*****</view>
      </view>
    </view>
    <RecordList />
    <Tabbar />
    <view :class="['set-secret-btn', {'active': isSecret}]" @click="toggleIsSecret">隐私模式</view>
  </view>
</template>

<script>
import RecordList from './components/recordList'
import { mapState, mapGetters, mapMutations } from 'vuex'
import Tabbar from '@/components/tabbar.vue'
import { getTableRecords } from '@/api/airtableRequest.js'
import table from '@/utils/globalConfig.js'
import moment from 'moment'

export default {
  data() {
    return {
      dateValue: '',
      startTouchPos: {},
      monthInfo: {
        expenseTotalAmt: '--',
        incomeTotalAmt: '--'
      }
    }
  },
  components: {
    RecordList,
    Tabbar,
  },
  computed: {
    ...mapState([
      "savings", 
      "chosenDay", 
      "isSecret"
    ]),
    ...mapGetters([
      "dailyRecords",
      "monthExpenseTotal",
      "monthIncomeTotal",
      "dailyExpenseTotal",
      "dailyIncomeTotal"
    ]),
    progressWidth() {
      let day = moment().date()
      let totalDay = moment().daysInMonth()
      let percentage = Number(day / totalDay).toFixed(2)
      return `width: ${Math.floor(550 * percentage)}rpx`
    }
  },
  methods: {
    ...mapMutations([
      "setChosenDay", 
      "setRecords",
      "setMonthRecords",
      "setSavings", 
      "toggleIsSecret",
      "initEnumeration",
    ]),

    // 获取月收支信息
    queryMonthRecords(month) {
      uni.showLoading({
        title: '加载中'
      })
      let filterFormula = `IS_SAME({month}, "${month}") = 1`
      getTableRecords(table.recordsTable, filterFormula)
        .then(res => {
          console.log("get month count res:", res)
          this.setMonthRecords(res.records.map(item => item.fields))
          uni.hideLoading()
        })
        .catch(err => {
          console.error("get month count err:", err)
        })
    },

    // 初始化积蓄信息
    querySavings() {
      getTableRecords(table.savingTable)
        .then(res => {
          console.log("get savings res:", res)
          this.setSavings(res.records.map(item => item.fields)[0])
        })
        .catch(err => {
          console.error("get savings err:", err)
        })
    },

    // 更改日期的三种方式
    onSelectDate(val) {  // 日历选择
      this.dateValue = val
      this.handleDateChange(this.dateValue)
    },
    toToday() {  // 回到今天
      this.dateValue = moment().format('yyyy-MM-DD')
      this.handleDateChange(this.dateValue)
    },
    shiftDay(n) {  // 前后增加天数
      this.dateValue = moment(this.dateValue).subtract(n, 'day').format('yyyy-MM-DD')
      this.handleDateChange(this.dateValue)
    },
    handleDateChange(newDate) {
      const chosenMonth = newDate.split('-')[1]
      if(chosenMonth != this.chosenDay.split('-')[1]) {
        this.queryMonthRecords(chosenMonth)
      }
      this.setChosenDay(newDate)
    },

    // 滑屏相关
    handleTouchStart(e) {
      this.startTouchPos = {...e.changedTouches[0]}
    },
    handleTouchMove(e) {
      let { clientX } = e.touches[0]
      if(clientX < this.startTouchPos.clientX) {
        this.shiftDay(1)
      }
      if(clientX > this.startTouchPos.clientX) {
        this.shiftDay(-1)
      }
    },

    toAdd() {
      console.log("to add!")
      uni.navigateTo({
        url: '/pages/addRecord/index?page=add'
      })
    },
  },

  onLoad() {
    console.log("DailyRecord created!")
    this.dateValue = new Date().toISOString().split('T')[0]
    this.queryRecordList(this.dateValue)
    this.querySavings()
    this.initEnumeration()
  },
}
</script>

<style lang="scss">
.fr {
  display: flex;
  align-items: center;
  gap: 10rpx;
}
.fc {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.daily-records {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
  // max-width: 600rpx;
  // min-height: 80vh;
  overflow: auto;
  position: relative;
  padding: 25rpx;
  min-height: 100vh;
  // background-color: lightblue;
}
.top {
    width: 100%;
    display: flex;
    gap: 10rpx;
    background-color: #fff;
    .date-picker {
        max-width: 300rpx;
        height: 80rpx;
        cursor: pointer;
        // cursor: pointer;
        &.today {
          height: 80rpx;
          padding: 0 20rpx;
          font-size: 28rpx;
          line-height: 80rpx;
          border-radius: 8rpx;
          border: 1px solid #ccc;
        }
    }
    .add {
        cursor: pointer;
        --size: 80rpx;
        width: var(--size);
        height: var(--size);
        border-radius: 50%;
        font-size: 50rpx;
        text-align: center;
        line-height: var(--size);
        border: 1px solid #ccc;
        box-shadow: 1rpx 1rpx 1rpx lightblue;
        
        transition: .3s;
        &:hover {
            transform: scale(1.1);
        }
    }
}

.month-progress {
    margin-top: 15rpx;
    border-radius: 8rpx;
    // border: 1px solid #ccc;
    height: 60rpx;
    background-color: #fff;
    .txt {
        margin-right: 25rpx;
        font-size: 28rpx;
    }
    .progress-bar {
        width: 550rpx;
        height: 30rpx;
        border-radius: 15rpx;
        border: 1px solid rgb(83, 203, 250);
        .progress-fill {
          background-color: rgb(83, 203, 250);
          border-radius: 15rpx;
          height: 100%;
        }
    }
}

.summary {
    height: 100rpx;
    margin-top: 15rpx;
    padding: 8rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 6rpx;
    box-shadow: 1rpx 2rpx 10rpx rgb(130, 163, 173);
    background-color: #fff;
    .summary-box {
        width: 45%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 8rpx;
        font-size: 30rpx;
    }
}
.vertical-line {
    height: 75%;
    width: 3rpx;
    background: rgb(104, 156, 172);
}
.set-secret-btn {
  position: fixed;
  bottom: 30rpx;
  right: 25rpx;
  padding: 10rpx;
  border: 1px solid #ccc;
  color: #ccc;
  &.active {
    border-color: #28f;
    color: #28f;
  }
}
</style>