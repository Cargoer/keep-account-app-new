<template>
    <view class="keyboard fr">
        <view class="left num-area fc">
            <view 
                v-for="(nums, index) in numbers" 
                :key="index" 
                class="line fr"
            >
                <view 
                    v-for="(num, index) in nums" 
                    :key="index"
                    class="number"
                    @click="setAmtInput(num)"
                >
                    {{num}}
                </view>
            </view>
            <view class="line fr">
                <view class="number zero" @click="setAmtInput(0)">0</view>
                <view class="number dot" @click="setAmtInput('.')">.</view>
            </view>
        </view>
        <view class="right op-area fc">
            <view class="operator delete" @click="deleteAmtInput()">×</view>
            <view class="operator confirm" @click="confirmAmtInput()">确认</view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            keyboardPopup: false, // 是否弹出虚拟自定义键盘
            numbers: [[1,2,3],[4,5,6],[7,8,9]]
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

<style lang="scss">
.fr {
    display: flex;
}
.fc {
    display: flex;
    flex-direction: column;
}
@mixin setTextCenter($lineHeight) {
    text-align: center;
    line-height: $lineHeight;
}
.keyboard {
    --single-height: 100rpx;
    width: 100%;
    height: 400rpx;
    position: fixed;
    left: 0;
    bottom: 0;
    .left {
      // flex: 2;
      width: 75%;
      .line {
        flex: 1;
        .number {
          flex: 1;
          
          // height: var(--single-height);
          // line-height: var(--single-height);
          // text-align: center;
          border-right: 1px solid #ccc;
          border-bottom: 1px solid #ccc;
          @include setTextCenter(var(--single-height));
          &.zero {
            flex: 2;
            border-bottom: none;
          }
          &.dot {
            border-bottom: none;
          }
        }
      }
    }
    .right {
        // flex: 1;
        width: 25%;
        .operator {
            width: 100%;
            &.delete {
              flex: 1;
              // height: var(--single-height);
              // line-height: var(--single-height);
              // text-align: center;
              @include setTextCenter(var(--single-height));
            }
            &.confirm {
              flex: 3;
              @include setTextCenter(calc(var(--single-height) * 3));
              color: #fff;
              background-color: rgb(243, 157, 60);
            }
        }
        
    }
}
</style>