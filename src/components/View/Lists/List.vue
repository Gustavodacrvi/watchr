<template>
  <transition
    appear
    :css='false'
    @enter='enter'
    @leave='leave'
  >
    <div class="List" :class="[platform]">
      <div class="cont-wrapper item-handle rb" ref="cont-wrapper">
        <div class="icon-wrapper">
          <Icon class="progress-icon"
            icon='pie'
            width='16px'
            :progress='getListProgress'
            color='var(--gray)'
          />
        </div>
        <div class="name">
          {{ item.name }}
        </div>
      </div>
    </div>
  </transition>
</template>

<script>

import Icon from '@/components/Icon.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    Icon,
  },
  props: ['item', 'changingViewName', 'itemHeight'],
  methods: {
    enter(el, done) {
      const cont = this.$refs['cont-wrapper']
      if (cont) {
        const s = cont.style

        if (!(this.changingViewName && !this.isDesktop)) {
          s.transitionDuration = '0s'
          s.opacity = 0
          s.height = 0
          
          requestAnimationFrame(() => {
            s.transitionDuration = '.25s'
            s.opacity = 1
            s.height = this.itemHeight + 'px'
            done()
          })
        }
      }
    },
    leave(el) {
      const cont = this.$refs['cont-wrapper']
      if (cont) {
        const s = cont.style

        s.transitionDuration = '0'
        s.height = this.itemHeight + 'px'
        s.opacity = 1
        requestAnimationFrame(() => {
          s.transitionDuration = '.25s'
          s.opacity = 0
          s.height = 0
        })
      }
    },
  },
  computed: {
    ...mapState({
      tasks: state => state.task.tasks,
    }),
    ...mapGetters(['isDesktop', 'platform']),
    getListProgress() {
      return this.$store.getters['list/pieProgress'](this.tasks, this.item.id, this.$store.getters['task/isTaskCompleted'])
    },
  },
}

</script>

<style scoped>

.List {
  height: 38px;
}

.mobile {
  height: 50px;
}

.cont-wrapper {
  display: flex;
  cursor: pointer;
}

.desktop .cont-wrapper:hover {
  background-color: var(--light-gray);
  cursor: default;
}

.name {
  flex-basis: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  margin-left: 6px;
}

.icon-wrapper {
  width: 35px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.progress-icon {
  opacity: .6;
  transform: translate(2px, 1px);
}

</style>
