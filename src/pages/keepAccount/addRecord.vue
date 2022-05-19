<template>
  <view class="add-record fc">
    <view class="tabbar">
      <button @click="switchRecordType('支出')" class="button" :class="{active: recordType == '支出'}">支出</button>
      <button @click="switchRecordType('收入')" class="button" :class="{active: recordType == '收入'}">收入</button>
    </view>

    <uni-datetime-picker
      type="date"
      :value="showDate"
      @change="onSelectDate"
    ></uni-datetime-picker>

    <view class="choose-category choose">
      <label>收支类别 - {{category? category: '请选择'}} </label>
      <!-- <el-viewider content-position="left">收支类别 - {{category? category: '请选择'}}</el-viewider> -->
      <view class="fr">
        <view
          v-for="(item, index) in (recordType == '支出'? expenseEnumeration: incomeEnumeration)"
          :key="index"
          @click="setCategory(item.value)"
          :class="['chooseIcon', 'fc', {chosen: category == item.value}]"
        >
          <i :class="'el-icon-'+item.icon"></i>
          <view>{{item.name}}</view>
        </view>
      </view>
    </view>
    <view class="choose-account choose">
      <label>收支账户 - {{accountType? accountType: '请选择'}} </label>
      <view class="fr">
        <view
          v-for="(item, index) in accountEnumeration"
          :key="index"
          @click="setAccount(item.value)"
          :class="['chooseIcon', {chosen: accountType == item.value}]"
        >
          <!-- <svg class="icon" aria-hidden="true">
            <use :xlink:href="'#'+item.icon"></use>
          </svg> -->
          <view>{{item.name}}</view>
        </view>
      </view>
    </view>
    <view class="input-amount fc">
      <label>内容 <input type="text" class="long-text-input" v-model="content" @focus="toggleKeyboard()"></label>
      <label>金额 <input type="text" class="number-input" v-model="amount"></label>
    </view>
    <view class="op-buttons fr">
      <button v-if="this.page == 'add'" class="op-button" @click="addRecord">添加</button>
      <button v-if="this.page == 'detail'" class="op-button" @click="modifyRecord">修改</button>
      <button v-if="this.page == 'detail'" class="op-button" @click="deleteRecord">删除</button>
      <button class="op-button" @click="navBack">返回</button>
    </view>
    <inputKeyboard 
      ref="keyboard" 
      @amtInput="setAmtInput"
      @amtDelete="deleteAmtInput"
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
  },
  methods: {
    ...mapMutations(["setChosenDay"]),
    onSelectDate(val) {
      this.showDate = val
      this.setChosenDay(val)
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
    toggleKeyboard() {
      this.$refs.keyboard.toggleKeyboard()
    },
    setAmtInput(val) {
      console.log('set amt input:', val)
      this.amount += val
    },
    deleteAmtInput() {
      console.log('delete amt input')
      this.amount = this.amount.slice(0, -1)
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
    gap: 15rpx;
}
.fc {
    display: flex;
    flex-direction: column;
    gap: 15rpx;
    align-items: center;
}
.add-record {
    max-width: 600rpx;
    margin: 20rpx;
    border-radius: 10rpx;
    // box-shadow: 2rpx 2rpx 10rpx rgba(168, 155, 150, .8);
    border-top: 5rpx solid rgb(245, 212, 102);
    overflow: auto;
    position: relative;
    padding: 20rpx;
    .tabbar {
        width: 100%;
        .button {
            width: 45%;
            height: 50rpx;
            border-radius: 25rpx 0 0 25rpx;
            background-color: rgb(164, 224, 248);
            border: none;
            outline: none;
            color: #fff
        }
        .button:last-child {
            border-radius: 0 25rpx 25rpx 0;
        }
        .active {
            background-color: rgb(83, 203, 250);
            transform: scale(1.05);
        }
    }
    .choose {
        width: 90%;
        position: relative;
        padding: 15rpx 10rpx 5rpx;
        border-top: 2rpx solid rgb(243, 215, 56);
        margin-top: 15rpx;
        label {
            position: absolute;
            top: 0;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fff;
            padding: 0 10rpx;
        }
        .chooseIcon {
            box-sizing: border-box;
            cursor: pointer;
            width: 4.2em;
            i {
                font-size: 30rpx;
            }
            &.chosen {
                // background-color: #9fe;
                border: 2rpx solid rgb(83, 203, 250);
                border-radius: 4rpx;
            }
        }
    }
    .input-amount {
        width: 90%;
        border-top: 2rpx solid rgb(243, 215, 56);
        padding: 15rpx;
        label {
            width: 90%;
        }
        input {
            width: 60%;
            height: 25rpx;
            border: 2rpx solid rgb(92, 143, 163);
            border-radius: 8rpx;
        }
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