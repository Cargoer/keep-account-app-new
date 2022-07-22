<template>
  <view class="tabbar">
    <view class="tab-item-box" v-for="(tab, index) in tabs" :key="index">
      <view class="tab-item" @click="showTabPage(tab.page)">
        <view class="tab-name">{{tab.icon? tab.icon: ''}}</view>
        <view class="tab-name">{{tab.name}}</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      tabs: [
        {
          name: '收支',
          icon: '',
          page: '/daily_record',
        },
        {
          name: '统计',
          icon: '',
          page: '/statistics',
        }
      ],
    }
  },
  methods: {
    showTabPage(page) {
      this.$router.push(page)
    },
  }
}
</script>

<style lang="scss">
.tabbar {
  width: 100%;
  height: 40rpx;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;

  display: flex;
  justify-content: space-around;
  align-items: center;

  border-radius: 8rpx 8rpx 0 0;
  box-shadow: 0 0 10rpx #5f85ef;

  .tab-item {
    display: flex;
    flex-direction: column;
    
  }
}
</style>