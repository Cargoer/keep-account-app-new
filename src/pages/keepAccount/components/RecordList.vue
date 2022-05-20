<template>
  <view class="record-list">
    <view v-for="(item, index) in records" :key="index">
      <view class="record fr" @click="toDetail(item)">
        <view class="typeIcon"></view>
        <view class="content">{{item.content?item.content: item.category}}</view>
        <view class="amount">
          {{signOfRecord(item)}}￥{{item.amount}}
        </view>
      </view>
      <!-- <Record :record="item"/> -->
    </view>
    
  </view>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  computed: {
    ...mapState(["records", "savings"]),
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
        url: '/pages/keepAccount/addRecord?page=detail'
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
      --type-icon-size: 25rpx;
      width: var(--type-icon-size);
      height: var(--type-icon-size);
      border: 1rpx solid black;
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