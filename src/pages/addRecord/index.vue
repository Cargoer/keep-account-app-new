<template>
  <view class="add-record fc">
    <view class="tabbar fr">
      <view @click="switchRecordType('支出')" class="button" :class="{active: recordType == '支出'}">支出</view>
      <view @click="switchRecordType('收入')" class="button" :class="{active: recordType == '收入'}">收入</view>
    </view>

    <view class="top-area fr">
      <view class="date-picker-area fr">
        <uni-icons type="calendar" size="40" color="#fff" @click="pickDate"></uni-icons>
        <uni-datetime-picker
          type="date"
          :value="showDate"
          @change="onSelectDate"
          ref="dateTimePicker"
          class="date-time-picker"
        ></uni-datetime-picker>
      </view>

      <view class="amt-input-area fr">
        <view class="amt">
          {{amount}}
        </view>
        <view class="placeholder" v-if="amount == ''">输入收支金额</view>
      </view>
    </view>
    
    <view class="choose-category choose">
      <view class="title">收支类别</view>
      <view class="choices fr">
        <view
          v-for="(item, index) in recordEnumeration"
          :key="index"
          @click="setCategory(item.value)"
          :class="['choice', 'fc', {chosen: category == item.value}]"
        >
          <view v-if="item.icon">
            <uni-icons :type="item.icon" size="30" :color="iconColor(item.value)" class="icon"></uni-icons>
          </view>
          <view v-else>
            <view class="icon default">{{ firstLetterOfName(item.name) }}</view>
          </view>
          <view class="name">{{item.name}}</view>
        </view>
      </view>
    </view>

    <view class="choose-account choose">
      <view class="title">收支账户</view>
      <view class="choices fr">
        <view
          v-for="(item, index) in accountEnumeration"
          :key="index"
          @click="setAccount(item.value)"
          :class="['choice', 'fc', {chosen: accountType == item.value}]"
        >
          <view v-if="item.icon">
            <uni-icons :type="item.icon" size="30" :color="iconColor(item.value)" class="icon"></uni-icons>
          </view>
          <view v-else>
            <view class="icon default">{{ firstLetterOfName(item.name) }}</view>
          </view>
          <view class="name">{{item.name}}</view>
        </view>
      </view>
    </view>
    <view class="input-content-area fr">
      <view class="txt">输入备注</view>
      <input class="content-input" type="text" v-model="content">
    </view>

    <inputKeyboard 
      ref="keyboard" 
      @amtInput="setAmtInput"
      @amtDelete="deleteAmtInput"
      @submit="addRecord"
    />  
  </view>
</template>

<script>
import {mapState, mapGetters, mapMutations} from 'vuex'
import inputKeyboard from './components/inputKeyboard'
export default {
  data() {
    return {
      showDate: '',
      page: '',
      // record字段
      category: '',
      accountType: '',
      content: '',
      amount: '',
      recordType: '支出',
      formerAmount: '',
      formerAccountType: '',

      // iconColor: '#555',

      // 控制字段
      isDetail: false, // 是否点击记录进入详情
    }
  },
  components: {
    inputKeyboard
  },
  computed: {
    ...mapState(["chosenDay", "curRecord"]),
    ...mapGetters(["expenseEnumeration", "incomeEnumeration", "accountEnumeration"]),
    iconColor() {
      return val => {
        return (val == this.accountType || val == this.category)? "rgb(29, 156, 206)": "#555"
      }
    },
    recordEnumeration() {
      return (this.recordType == '支出'? this.expenseEnumeration: this.incomeEnumeration)
    }
  },
  methods: {
    ...mapMutations(["setChosenDay"]),
    onSelectDate(val) {
      this.showDate = val
      this.setChosenDay(val)
    },
    pickDate() {
      this.$refs.dateTimePicker.show()
    },
    switchRecordType(str) {
      this.recordType = str
    },
    addRecord() {
      let record = {
        createTime: this.chosenDay,
        amount: Number(this.amount),
        content: this.content,
        recordType: this.recordType,
        category: this.category,
        accountType: this.accountType
      }
      console.log(record)
      this.$store.commit("insert", record)
      uni.navigateBack()
    },
    // TODO 日期也有可能改变
    modifyRecord() {
      let change = {
        amount: Number(this.amount),
        content: this.content,
        category: this.category,
        accountType: this.accountType
      }
      let payLoad = {
        id: this.curRecord.id,
        change: change,
        formerData: {
          amount: this.formerAmount,
          accountType: this.accountType
        }
      }
      console.log("payLoad before:", payLoad)
      this.$store.commit("update", payLoad)
      this.$router.push('/daily_record')
    },
    deleteRecord() {
      this.$store.commit("delete", [this.curRecord.id])
      this.$router.push('/daily_record')
    },
    setAccount(val) {
      this.accountType = val
    },
    setCategory(val) {
      this.category = val
    },
    navBack() {
      uni.navigateBack()
    },
    setAmtInput(val) {
      console.log('set amt input:', val)
      this.amount += val
    },
    deleteAmtInput() {
      console.log('delete amt input')
      this.amount = this.amount.slice(0, -1)
    },
    firstLetterOfName(name) {
      return name[0] || '类'
    }
  },
  onLoad(e) {
    console.log(e)
    this.page = e.page
    this.showDate = this.curRecord?.createTime || this.chosenDay
    console.log(this.showDate)
    if(e.page == 'detail') {
      if(!this.curRecord){
        console.error("err: do not get current record!")
        return
      }
      console.log("curRecord:", this.curRecord)
      this.category = this.curRecord.category
      this.accountType = this.curRecord.accountType
      this.formerAccountType = this.curRecord.accountType
      this.content = this.curRecord.content
      this.amount = this.curRecord.amount
      this.formerAmount = this.curRecord.amount
      this.recordType = this.curRecord.recordType
    }
  }
}
</script>

<style lang="scss">
.fr {
    display: flex;
    // gap: 15rpx;
    align-items: center;
}
.fc {
    display: flex;
    flex-direction: column;
    // gap: 15rpx;
    align-items: center;
}
:root {
  --theme-color: lightblue;
}
.add-record {
    border-radius: 10rpx;
    // box-shadow: 2rpx 2rpx 10rpx rgba(168, 155, 150, .8);
    overflow: auto;
    position: relative;
    // padding: 20rpx;
    min-height: 100vh;
    // background-color: lightblue;
    .tabbar {
        // width: 100%;
        .button {
            width: 200rpx;
            height: 60rpx;
            border-radius: 10rpx 0 0 10rpx;
            // background-color: rgb(83, 203, 250);
            border: 1px solid rgb(83, 203, 250);
            color: #333;
            text-align: center;
            line-height: 60rpx;
            font-size: 28rpx;
        }
        .button:last-child {
            border-radius: 0 10rpx 10rpx 0;
        }
        .active {
            background-color: rgb(83, 203, 250);
            color: #fff;
            // transform: scale(1.05);
        }
    }
    .top-area {
      margin-top: 25rpx;
      width: 100%;
      height: 100rpx;
      background-color: lightblue;
      padding-left: 20rpx;
      .date-picker-area {
        height: 60rpx;
        position: relative;
        .date-time-picker {
          position: absolute;
          left: -1000rpx;
        }
      }
      .amt-input-area {
        background-color: #fff;
        padding-left: 15rpx;
        margin-left: 20rpx;
        height: 60rpx;
        width: 400rpx;
        // border: 3px solid rgb(83, 203, 250);
        border-radius: 12rpx;
        .amt {
          font-size: 34rpx;
          line-height: 60rpx;
          position: relative;
          &::after {
            width: 4rpx;
            height: 40rpx;
            background: #0B85FF;
            position: absolute;
            right: -1rpx;
            top: 50%;
            transform: translateY(-50%);
            // float: right;
            content: " ";
            // margin-left: 1rpx;
            animation: cursor-blinks 1.5s infinite steps(1, start);
          }
        }
        .placeholder {
          margin-left: 5rpx;
          font-size: 28rpx;
          color: #ccc;
          line-height: 60rpx;
        }
      }
    }
    .choose {
        // width: 90%;
        position: relative;
        // padding: 15rpx 10rpx 5rpx;
        // border-top: 2rpx solid rgb(243, 215, 56);
        margin-top: 15rpx;
        width: 100%;
        .title {
          font-size: 30rpx;
          padding: 20rpx;
          background-color: lightblue;
          color: #fff;
        }
        .choices {
          flex-wrap: wrap;
          background-color: #fff;
          padding-top: 20rpx;
          padding-left: 20rpx;
          .choice {
            box-sizing: border-box;
            cursor: pointer;
            width: 120rpx;
            height: 120rpx;
            align-items: center;
            .icon {
              width: 60rpx;
              height: 60rpx;
              &.default {
                border-radius: 100%;
                border: 1px solid #555;
                color: #555;
                font-size: 30rpx;
                text-align: center;
                line-height: 60rpx;
              } 
            }
            .name {
              font-size: 26rpx;
              margin-top: 10rpx;
            }
            &.chosen {
              .name {
                color: rgb(29, 156, 206);
              }
              .default {
                color: #fff;
                background-color: rgb(29, 156, 206);
                border: 1px solid rgb(29, 156, 206);
              }
            }
          }
          
        }
    }

    .input-content-area {
      height: 100rpx;
      width: 100%;
      position: fixed;
      left: 0;
      bottom: constant(safe-area-inset-bottom);
	    bottom: env(safe-area-inset-bottom);
      // bottom: 400rpx;
      margin-bottom: 400rpx;
      border-top: 1px solid #555;
      border-bottom: 1px solid #555;
      .txt {
        height: 100rpx;
        width: 210rpx;
        font-size: 32rpx;
        line-height: 100rpx;
        // padding: 0 25rpx;
        text-align: center;
        box-shadow: 5rpx 0 10rpx #555;
      }
      .content-input {
        height: 60rpx;
        margin-left: 25rpx;
      }
    }
}

@keyframes cursor-blinks {
  0% {
    opacity: 1;
    display: block;
  }
  50% {
    opacity: 0;
    display: none;
  }
  100% {
    opacity: 1;
    display: block;
  }
}

.chooseIcon .icon {
    /* width: 40rpx;
    height: 40rpx; */
    font-size: 16rpx;
    /* border-radius: 5rpx; */
    /* border-radius: 1rpx solid rgb(164, 224, 248); */
}
.chosen svg {
    border: 2rpx solid rgb(83, 203, 250);
    border-radius: 6rpx;
}
.icon {
    width: 1em; height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
}
.icon use {
    width: 100%; height: 100%;
}
.op-button {
    width: 80rpx;
    height: 40rpx;
    border: none;
    outline: none;
    border-radius: 8rpx;
    background: rgb(66, 199, 252);
    color: #fff;
    cursor: pointer;
}
</style>