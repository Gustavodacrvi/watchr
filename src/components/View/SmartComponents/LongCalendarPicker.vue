<template>
  <div class="LongCalendarPicker" :class="platform"
    @scroll.prevent
    @whell.prevent
    @touchmove.prevent
  >
    <div class="wrapper" ref="wrapper">
      <div class="week-view last-week" ref="last-week">
        last-week
      </div>
      <div class="week-view this-week" ref='this-week'>
        this-week
      </div>
      <div class="week-view next-week" ref="next-week">
        next-week
      </div>
    </div>

    <div v-if="isDesktop" class="btn shadow right-btn cursor">
      <Icon class="icon"
        icon='tiny-arrow'
        width='35px'
      />
      <CircleBubble
        innerColor='var(--light-gray)'
        outerColor='var(--gray)'
        opacity='0'
      />
    </div>
    <div v-if="isDesktop" class="btn shadow left-btn cursor">
      <Icon class="icon"
        icon='tiny-arrow'
        width='35px'
      />
      <CircleBubble
        innerColor='var(--light-gray)'
        outerColor='var(--gray)'
        opacity='0'
      />
    </div>
  </div>
</template>

<script>

import Icon from '@/components/Icon.vue'

import mom from 'moment/src/moment'
import { mapGetters } from 'vuex'

const TOD = mom()
const TOD_STR = TOD.format('Y-M-D')

export default {
  components: {
    Icon,
  },
  data() {
    return {
      active: TOD_STR,
      lastWeek: TOD.clone().subtract(1, 'week').startOf('week').format('Y-M-D'),
      weekStart: TOD.clone().startOf('week').format('Y-M-D'),
      nextWeek: TOD.clone().add(1, 'week').startOf('week').format('Y-M-D'),
    }
  },
  mounted() {
    const el = this.$refs['wrapper']
    el.scrollLeft = el.scrollWidth * (1 / 3)
  },
  computed: {
    ...mapGetters(['isDesktop', 'platform']),
    mom() {
      return mom(this.active, 'Y-M-D')
    },
    displayArr() {

    },
  },
}

</script>

<style scoped>

.LongCalendarPicker {
  position: relative;
  height: 60px;
  overflow: visible;
  background: var(--purple);
}

.wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.btn {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translateY(-50%);
  top: 50%;
  background-color: var(--card);
  width: 40px;
  height: 40px;
  border-radius: 1000px;
  overflow: hidden;
  transition-duration: .2s;
}

.btn:hover {
  background-color: var(--light-gray);
}

.right-btn {
  right: -50px;
}

.right-btn .icon {
  transform: rotate(-90deg) translateY(-3px);
}

.left-btn {
  left: -50px;
}

.left-btn .icon {
  transform: rotate(90deg) translateY(3px);
}

.week-view {
  position: absolute;
  width: 100%;
  height: 100%;
}

.last-week {
  left: 0;
  background-color: red;
}

.this-week {
  left: 100%;
  background-color: yellow;
}

.next-week {
  left: 200%;
  background-color: green;
}

</style>
