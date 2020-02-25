<template>
  <div class="Timeline" :class="layout" @click.stop>
    <div class="wrapper cursor">
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

import utils from '@/utils/'

import { mapState, mapGetters } from 'vuex'

export default {
  props: ['id', 'buffer', 'index', 'start', 'startHour', 'startMin', 'end', 'endHour', 'endMin', 'region'],
  mounted() {
    utils.bindOptionsToEventListener(this.$el, this.options, this, 'click')
  },
  methods: {
    add(time) {
      this.$emit('change-time', {time, add: true})
    },
    remove(time) {
      this.$emit('change-time', {time, add: false})
    },
  },
  computed: {
    ...mapState({
      userInfo: state => state.userInfo,
    }),
    ...mapGetters(['layout']),
    options() {
      return [
        {
          name: 'Add time',
          callback: () => ({
            comp: "TimePicker",
            content: {
              callback: this.add
            }
          }),
        },
        {
          name: 'Remove time',
          callback: () => ({
            comp: "TimePicker",
            content: {
              callback: this.remove
            }
          }),
        },
      ]
    },
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

.wrapper {
  display: flex;
  transform: scale(1,1);
  transition-duration: .2s;
}

.wrapper:hover {
  transform: scale(1.1,1.1);
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
