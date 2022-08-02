<template>
  <view class="daily-records">
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
        <!-- <el-progress 
          :text-inside="true" 
          :stroke-width="26" 
          :percentage="Number(dayOfMonth)" >
        </el-progress> -->
        <view class="progress-fill" :style="progressWidth"></view>
      </view>
    </view>
    <view class="summary">
      <view class="summary-box fc">
        <label class="summary-text">今日收支</label>
        <view class="daily-total">￥{{dailyTotal.toFixed(2)}}</view>
      </view>
      <view class="vertical-line"></view>
      <view class="summary-box fc">
        <label class="summary-text">剩余积蓄</label>
        <view class="remain-saving">￥{{savings.saving.toFixed(2)}}</view>
      </view>
    </view>
    <RecordList />
    <Tabbar />
  </view>
</template>

<script>
import RecordList from './components/recordList'
import { mapState, mapGetters, mapMutations } from 'vuex'
import Tabbar from '@/components/tabbar.vue'
import { getTableRecords } from '@/api/airtableRequest.js'
import table from '@/utils/globalConfig.js'

export default {
  data() {
    return {
      dateValue: '',
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
    ]),
    ...mapGetters([
      'dailyTotal'
    ]),
    progressWidth() {
      let now = new Date(),
          day = now.getDate(),
          totalDay = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate()
      let percentage = Number(day / totalDay).toFixed(2)
      return `width: ${Math.floor(550 * percentage)}rpx`
    }
  },
  methods: {
    ...mapMutations([
      "setChosenDay", 
      "setRecords", 
      "setSavings", 
      "initEnumeration"
    ]),

    // 初始化收支记录
    queryRecordList(date) {
      uni.showLoading({
        title: '加载中'
      })
      this.setChosenDay(date)
      
      let filterFormula = `IS_SAME({createTime}, "${date}") = 1`
      getTableRecords(table.recordsTable, filterFormula)
        .then(res => {
          console.log("get records res:", res)
          this.setRecords(res.records.map(item => item.fields))
          uni.hideLoading()
        })
        .catch(err => {
          console.error("get records err:", err)
          uni.hideLoading()
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
      this.queryRecordList(val)
    },
    toToday() {  // 回到今天
      this.dateValue = new Date().toISOString().split('T')[0]
      this.queryRecordList(this.dateValue)
    },
    shiftDay(n) {  // 前后增加天数
      let tempDate = new Date(this.dateValue)
      tempDate.setDate(tempDate.getDate() + n)
      this.dateValue = tempDate.toISOString().split('T')[0]
      console.log("dateValue after shift:", this.dateValue)
      this.queryRecordList(this.dateValue)
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
</style>