<template>
  <view class="record-list">
    <view v-for="(item, index) in dailyRecords" :key="index">
      <view class="record fr" @click="toDetail(item)">
        <view class="typeIcon">{{ item.category[0] }}</view>
        <view class="content" v-if="!isSecret">{{item.content?item.content: item.category}}</view>
        <view class="content" v-else>****</view>
        <view class="amount" v-if="!isSecret">
          {{signOfRecord(item)}}￥{{item.amount}}
        </view>
        <view class="amount" v-else>***</view>
      </view>
    </view>
  </view>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'

export default {
  computed: {
    ...mapState(["records", "savings", "isSecret"]),
    ...mapGetters(["dailyRecords"])
  },
  methods: {
    ...mapMutations(["setCurRecord"]),
    signOfRecord(item) {
      return item.recordType === '支出'? '-': '+'
    },
    toDetail(item) {
      console.log("toDetail")
      this.setCurRecord(item)
      uni.navigateTo({
        url: '/pages/addRecord/index?page=detail'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.fr {
  display: flex;
  align-items: center;
  // gap: 10rpx;
}
.record-list {
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  padding: 20rpx 30rpx;
  /* box-shadow: 1rpx 1rpx 2rpx gray; */
  box-sizing: border-box;
  width: 100%;

  .record {
    // width: 90%;
    height: 100rpx;
    position: relative;
    border-bottom: 1rpx solid #ccc;
    // padding: auto 10rpx;
    padding-left: 10rpx;

    .typeIcon {
      --type-icon-size: 50rpx;
      width: var(--type-icon-size);
      height: var(--type-icon-size);
      border: 1rpx solid black;
      border-radius: 100%;
      line-height: var(--type-icon-size);
      text-align: center;
      font-size: 28rpx;
    }
    .content {
      margin-left: 25rpx;
      font-size: 30rpx;
    }
    .amount {
      font-size: 30rpx;
      position: absolute;
      right: 10rpx;
    }
  }
}
</style>