<template>
  <div class="ItemCont">
    <div class="cont">
      <div class="icon-wrapper">
        <TaskIcons
          :co='completed'
          :color='circleColor'
          :se='isSelecting'
          :ac='isItemSelected'
          :ca='canceled'
          :so='isSomeday'
          :re='isRepeatingItem'
        />
      </div>
      <div>
        <div class="text">
          {{ name }}
        </div>
        <transition
          @enter='enterInfo'
          @leave='leaveInfo'
        >
          <div v-if="false"
            class="info"
          >
            fdsa
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>

import TaskIcons from '../Tasks/TaskIcons.vue'

import utilsTask from '@/utils/task'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    TaskIcons,
  },
  props: [
    'movingItem', 'isSelecting',
    
    'name', 'priority', 'id', 'calendar',
  ],
  data() {
    return {
      completed: false,
      canceled: false,
      test: 0,
    }
  },
  created() {
    setInterval(() => this.test++, 2500)
  },
  methods: {
    enterInfo(el, done) {
      const s = el.style
      
      const height = getComputedStyle(el).height

      s.transitionDuration = 0
      s.height = 0
      s.opacity = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'
        s.height = height
        s.opacity = .7

        setTimeout(done, 250)
      })

    },
    leaveInfo(el, done) {
      const s = el.style

      s.transitionDuration = 0
      s.height = 'auto'
      s.opacity = .7

      requestAnimationFrame(() => {
        const height = getComputedStyle(el).height

        s.height = height

        requestAnimationFrame(() => {
          s.transitionDuration = '.2s'
          s.height = 0
          s.opacity = 0

          setTimeout(() => {
            s.height = 'auto'
            s.opacity = 0
            done()
          }, 210)
        })
      })

    },
  },
  computed: {
    ...mapState({
      selectedItems: state => state.selectedItems,
    }),

    hasInfo() {
      return (this.test % 2) === 0
    },

    circleColor() {
      if (!this.priority) return ''
      const obj = {
        'Low priority': 'var(--green)',
        'Medium priority': 'var(--yellow)',
        'High priority': 'var(--red)',
      }
      return obj[this.priority]
    },
    isItemSelected() {
      return !this.movingItem && this.selectedItems.includes(this.id)
    },
    isSomeday() {
      return this.calendar && this.calendar.type === 'someday'
    },
    isRepeatingItem() {
      return utilsTask.isRecurringTask(this.calendar)
    },
  },
}

</script>

<style scoped>

.ItemCont {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.cont {
  position: relative;
  height: 100%;
  width: 100%;

  display: flex;
  align-items: center;
}

.icon-wrapper {
  position: relative;
  height: 100%;
  width: 35px;
  opacity: .4;
}

.text {
  height: 60%;
}

.info {
  height: 40%;
  font-size: .8em;
  opacity: .7;
  overflow: visible;
}

</style>
