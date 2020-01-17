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
          <div class="list-name-wrapper">
            {{ item.name }}
            <span v-if="listTasksLength" class="list-inf">{{ listTasksLength }}</span>
          </div>
        </div>
        <div class="info">
        </div>
      </div>
    </div>
  </transition>
</template>

<script>

import Icon from '@/components/Icon.vue'

import utils from "@/utils"
import utilsList from "@/utils/list"

import { mapGetters, mapState, mapActions } from 'vuex'

export default {
  components: {
    Icon,
  },
  props: ['item', 'changingViewName', 'itemHeight'],
  mounted() {
    this.bindContextMenu()
  },
  methods: {
    ...mapActions(['getOptions']),
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

    async bindContextMenu() {
      utils.bindOptionsToEventListener(this.$el, await this.getOptions(utilsList.listOptions(this.item)), this)
    },
  },
  computed: {
    ...mapState({
      tasks: state => state.task.tasks,
    }),
    ...mapGetters({
      platform: 'platform',
      isDesktop: 'isDesktop',
      getListTasks: 'list/getTasks',
    }),
    listTasks() {
      return this.getListTasks(this.tasks, this.item.id)
    },
    listTasksLength() {
      return this.listTasks.length
    },
    getListProgress() {
      return this.$store.getters['list/pieProgress'](this.tasks, this.item.id, this.$store.getters['task/isTaskCompleted'])
    },
  },
  watch: {
    list() {
      this.bindContextMenu()
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
  position: relative;
}

.list-name-wrapper {
  max-width: 100%;
  position: absolute;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info {
  height: 100%;
  display: flex;
  align-items: center;
  margin-left: 20px;
  margin-right: 6px;
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

.list-inf {
  margin-left: 4px;
  opacity: .6;
}

</style>
