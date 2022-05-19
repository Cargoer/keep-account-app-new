<template>
  <view class="daily-records">
    <view class="top">
      <uni-datetime-picker
        type="date"
        :value="dateValue"
        @change="onSelectDate"
      ></uni-datetime-picker>
      <view class="date-picker today" @click="toToday">今天</view>
      <!-- TODO 放在下面正中间 -->
      <button class="add" @click="toAdd">+</button>
    </view>
    
    <view class="month-progress">
      <span>本月进度  </span>
      <view class="progress-bar">
        <!-- <el-progress 
          :text-inside="true" 
          :stroke-width="26" 
          :percentage="Number(dayOfMonth)" >
        </el-progress> -->
      </view>
    </view>
    <view class="summary">
      <view class="summary-box">
        <label class="summary-text">今日收支</label>
        <view class="daily-total">￥{{dailyTotal}}</view>
      </view>
      <view class="vertical-line"></view>
      <view class="summary-box">
        <label class="summary-text">剩余积蓄</label>
        <view class="remain-saving">￥{{savings.saving}}</view>
      </view>
    </view>
    <RecordList />
    <Tabbar />
    
    <button class="date-shift-button left" @click="shiftDay(-1)">&lt;</button>
    <button class="date-shift-button right" @click="shiftDay(1)">&gt;</button>
  </view>
</template>

<script>
import RecordList from './components/RecordList.vue'
import { mapState, mapGetters, mapMutations } from 'vuex'
import Tabbar from './components/tabbar.vue'
export default {
  data() {
    return {
      dateValue: '',
      showCalendar: false,
    }
  },
  components: {
    RecordList,
    Tabbar,
  },
  computed: {
    ...mapState(["savings", "chosenDay", "recordsTable", "savingTable"]),
    ...mapGetters(['dailyTotal']),
    dayOfMonth() {
      let now = new Date(),
          day = now.getDate(),
          totalDay = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate()
      return Number(day / totalDay * 100).toFixed(1)
    }
  },
  methods: {
    ...mapMutations(["setChosenDay", "setRecords", "setSavings", "initEnumeration"]),
    // 初始化收支记录
    queryRecordList(date) {
      uni.showLoading({
        title: '加载中'
      })
      this.setChosenDay(date)
      let curDate = date
      // curDate.setHours(curDate.getHours() + 8)
      // console.log("iso:", curDate.toISOString().split('T')[0])
      
      let filterFormula = `IS_SAME({createTime}, "${curDate}") = 1`
      console.log("filterFormula:", filterFormula)
      this.recordsTable.getRecords(filterFormula)
        .then(records => {
          console.log("get records res:", records)
          // state.records = records
          this.setRecords(records)
          uni.hideLoading()
        })
        .catch(err => {
          console.error("get records err:", err)
          uni.hideLoading()
        })
    },

    // 初始化积蓄信息
    querySavings() {
      this.savingTable.getRecords()
        .then(records => {
          console.log("get savings res:", records)
          this.setSavings(records[0])
        })
        .catch(err => {
          console.error("get savings err:", err)
        })
    },

    onSelectDate(val) {
      this.dateValue = val
      this.queryRecordList(val)
    },

    toToday() {
      this.dateValue = new Date().toISOString().split('T')[0]
      this.queryRecordList(this.dateValue)
    },

    toAdd() {
      console.log("to add!")
      uni.navigateTo({
        url: '/pages/keepAccount/addRecord?page=add'
      })
    },

    shiftDay(n) {
      let tempDate = new Date(this.dateValue)
      tempDate.setDate(tempDate.getDate() + n)
      this.dateValue = tempDate.toISOString().split('T')[0]
      console.log("dateValue after shift:", this.dateValue)
      this.queryRecordList(this.dateValue)
    },

    progressFormat(percentage) {
      return `本月进度 ${Math.round(percentage)}%`
    }
  },
  created() {
    console.log("DailyRecord created!")
    this.dateValue = new Date().toISOString().split('T')[0]
    this.queryRecordList(this.dateValue)
    this.querySavings()
    this.initEnumeration()
  },
}
</script>

<style lang="scss">
.daily-records {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
  // max-width: 600rpx;
  min-height: 80vh;
  // margin: 20rpx;
  border-radius: 10rpx;
  // box-shadow: 2rpx 2rpx 10rpx rgba(168, 155, 150, .8);
  border-top: 5rpx solid rgb(245, 212, 102);
  overflow: auto;
  position: relative;
  padding: 20rpx;
}
.top {
    width: 100%;
    display: flex;
    gap: 10rpx;
    .date-picker {
        max-width: 300rpx;
        // cursor: pointer;
    }
    .today-button {
        max-width: 100rpx;
        border: none;
        cursor: pointer;
        border-radius: 6rpx;
    }
    .add {
        cursor: pointer;
        --size: 60rpx;
        width: var(--size);
        height: var(--size);
        border-radius: 50%;
        font-size: 50rpx;
        text-align: center;
        line-height: var(--size);
        outline: none;
        border: none;
        box-shadow: 1rpx 1rpx 1rpx 1rpx lightblue;

        position: absolute;
        top: 20rpx;
        right: 20rpx;
        
        transition: .3s;
        &:hover {
            transform: scale(1.1);
        }
    }
}

.month-progress {
    margin-top: 15rpx;
    span {
        margin-right: 10rpx;
    }
    .progress-bar {
        width: 70%;
        display: inline-block;
    }
}

.summary {
    height: 85rpx;
    margin-top: 15rpx;
    padding: 8rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 6rpx;
    box-shadow: 1rpx 2rpx 10rpx rgb(130, 163, 173);
    .summary-box {
        width: 45%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 8rpx;
    }
}



.date-shift-button {
    width: 40rpx;
    height: 100rpx;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    border-radius: 0 10rpx 10rpx 0;
    transition: .5s;
}
.left {
    left: 0;
}
.right {
    right: 0;
    border-radius: 10rpx 0 0 10rpx;
}
.date-shift-button:hover {
    /* border: 1rpx solid rgba(50,50,50,.5); */
    box-shadow: 2rpx 2rpx 5rpx rgba(10,50,50,.5);
}
.right:hover {
    box-shadow: -2rpx 2rpx 5rpx rgba(10,50,50,.5);
}
.vertical-line {
    height: 75%;
    width: 3rpx;
    background: rgb(104, 156, 172);
}
</style>