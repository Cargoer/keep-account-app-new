<template>
    <view class="keyboard grid">
      <view 
        class="cell" 
        v-for="(item, index) in numbers" 
        :key="index"
        :style="[gridArea('n'+item)]"
        @click="setAmtInput(item)"
      >
        {{ item }}
      </view>

      <view class="cell" :style="[gridArea('dot')]" @click="setAmtInput('.')">.</view>

      <view class="cell" :style="[gridArea('backspace')]" @click="deleteAmtInput()">×</view>
      
      <view 
        class="cell confirm" 
        :style="[gridArea('confirm')]" 
        @click="confirmAmtInput"
      >
        确认
      </view>
    </view>
</template>

<script>
export default {
  data() {
    return {
      numbers: [1,2,3,4,5,6,7,8,9,0]
    }
  },
  computed: {
    gridArea() {
      return val => {
        return {
          gridArea: val
        }
      }
    }
  },
  methods: {
    setAmtInput(val) {
      this.$emit("amtInput", val)
    },
    deleteAmtInput() {
      this.$emit("amtDelete")
    },
    toggleKeyboard() {
      this.keyboardPopup = !this.keyboardPopup
    },
    confirmAmtInput() {
      this.$emit("submit")
    }
  }
}
</script>

<style lang="scss" scoped>
* {
  box-sizing: border-box;
}
@mixin setTextCenter($lineHeight) {
  text-align: center;
  line-height: $lineHeight;
}
.keyboard {
  --single-height: 100rpx;
  width: 100%;
  height: calc(var(--single-height) * 4);
  position: fixed;
  left: 0;
  bottom: 0;
  bottom: constant(safe-area-inset-bottom);
  bottom: env(safe-area-inset-bottom);

  &.grid {
    display: grid;
    grid-template-rows: repeat(4, 1fr);
    grid-template-columns: repeat(4, 1fr);
    grid-template-areas: 'n1 n2 n3 backspace'
                         'n4 n5 n6 confirm'
                         'n7 n8 n9 confirm'
                         'n0 n0 dot confirm';
  }

  .cell {
    height: var(--single-height);
    @include setTextCenter(var(--single-height));
    border-right: 1px solid #ccc;
    border-bottom: 1px solid #ccc;

    &.confirm {
      height: calc(var(--single-height) * 3);
      @include setTextCenter(calc(var(--single-height) * 3));
      color: #fff;
      background-color: rgb(243, 157, 60);
    }
  }
}
</style>