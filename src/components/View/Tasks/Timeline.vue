<template>
  <div class="Timeline" :class="platform">
    <div class="wrapper">
      <div class="hour">
        <span class="h">{{ startHour }}</span>
      </div>
      <span class="info">
        <span class="min fade">{{ startMin }}</span>
        <span v-if="!userInfo.disablePmFormat" class="region fade">{{ region }}</span>
      </span>
    </div>
  </div>
</template>

<script>

import { mapState, mapGetters } from 'vuex'

export default {
  props: ['id', 'buffer', 'index', 'start', 'startHour', 'startMin', 'end', 'endHour', 'endMin', 'region'],
  computed: {
    ...mapState({
      userInfo: state => state.userInfo,
    }),
    ...mapGetters(['platform'])
  }
}

</script>

<style scoped>

.Timeline {
  top: 50%;
  transform: translateY(-50%);
  float: right;
  position: absolute;
  right: calc(100% + 10px);
}

.Timeline.desktop {
}

.wrapper {
  display: flex;
}

.hour {
  font-size: 2em;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-width: 35px;
  text-align: center;
}

.h {
  width: 100%;
}

.info {
  font-size: .8em;
  display: inline-flex;
  justify-content: center;
  flex-direction: column;
}

.fade {
  opacity: .4;
}

</style>
