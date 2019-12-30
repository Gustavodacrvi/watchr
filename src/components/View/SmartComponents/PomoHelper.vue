<template>
  <div class="PomoHelper">
    <div class="progress-line">
      <div class="line" :style='{width, backgroundColor: color}'></div>
    </div>
  </div>  
</template>

<script>

import { mapState, mapGetters } from 'vuex'

export default {
  computed: {
    ...mapState({
      total: state => state.pomo.currentDuration,
      current: state => state.pomo.current,
    }),
    ...mapGetters({
      platform: 'platform',
      color: 'pomo/getPomoColor',
      shadow: 'pomo/getPomoShadow',
      currentValue: 'pomo/currentValue',
      totalValue: 'pomo/totalValue',
      getTime: 'pomo/getTime',
    }),
    width() {
      return (100 * this.currentValue / this.totalValue) + '%'
    },
  }
}

</script>

<style scoped>

.PomoHelper {
  height: 90px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.progress-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  border-radius: 16px;
  overflow: hidden;
}

.line {
  height: 100%;
  transition-duration: .3s;
}

</style>
