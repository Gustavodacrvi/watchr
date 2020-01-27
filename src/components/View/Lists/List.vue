<template>
  <transition name="list-trans"
    appear
    :css='true'
    @enter='enter'
  >
    <div class="List" :class="[platform, {completed, isItemMainSelection, isItemSelected}]">
      <div v-if="!editing"
        class="cont-wrapper item-handle rb"
        ref="cont-wrapper"

        @click.stop="editing = true"
      >
        <CircleBubble v-if="!isDesktop"
          innerColor='var(--light-gray)'
          outerColor='var(--fade)'
          opacity='0'
        />
        <div class="cont">
          <div @click.stop="completeList" class="icon-wrapper">
            <Icon v-if="!completed" class="progress-icon cursor remove-highlight"
              :icon='progressIcon'
              width='15px'
              :progress='getListProgress'
              color='var(--fade)'
            />
            <Icon v-else class="progress-icon cursor remove-highlight"
              :icon='circleIcon'
              width='22px'
              color='var(--fade)'
            />
          </div>
          <div class="name">
            <div class="list-name-wrapper">
              {{ item.name }}
              <span v-if="listTasksLength" class="list-inf fade">{{ listTasksLength }}</span>
            </div>
          </div>
          <div class="info">
            <template>
              <Icon v-if="deadlineStr" class="deadline list-inf icon"
                icon='deadline'
                width='16px'
              />
              <span v-if="deadlineStr" class='list-inf deadline'>{{ deadlineStr }}</span>
            </template>
            <span v-if="calendarStr" class="list-inf">{{ calendarStr }}</span>
            <Icon v-if="isSomeday" class="progress-icon"
              icon='archive'
              width='22px'
              color='var(--fade)'
            />
          </div>
        </div>
      </div>
      <div v-else>
        <ListEdit
          :name='item.name'
          @save='save'
          @cancel='editing = false'
        />
      </div>
    </div>
  </transition>
</template>

<script>

import Icon from '@/components/Icon.vue'

import utils from "@/utils"
import utilsList from "@/utils/list"

import ListEdit from "./Edit.vue"

import { mapGetters, mapState, mapActions } from 'vuex'

import mom from 'moment'

import ListItemMixin from "@/mixins/listItem"

export default {
  mixins: [ListItemMixin],
  components: {
    Icon,
    ListEdit,
  },
  props: ['item', 'changingViewName', 'itemHeight'],
  data() {
    return {
      editing: false,
    }
  },
  mounted() {
    this.bindContextMenu()
  },
  methods: {
    ...mapActions(['getOptions']),
    dispatchCompleteItem() {
      this.$store.dispatch('list/completeLists', [this.item])
    },
    dispatchUncompleteItem() {
      this.$store.dispatch('list/uncompleteLists', [this.item])
    },
    dispatchCancelItem() {
      this.$store.dispatch('list/cancelLists', [this.item.id])
    },
    dispatchUncancelItem() {
      this.$store.dispatch('list/uncancelLists', [this.item.id])
    },
    
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
    saveList(obj) {
      this.$store.dispatch('list/saveList', {
        id: this.item.id,
        ...obj,
      })
    },
    save(obj) {
      this.saveList(obj)
      this.editing = false
    },
    completeList() {
      if (!this.completed)
        this.$store.dispatch('list/completeLists', [this.item])
      else this.$store.dispatch('list/uncompleteLists', [this.item])
    },

    async bindContextMenu() {
      utils.bindOptionsToEventListener(this.$el, await this.getOptions(utilsList.listOptions(this.item)), this)
    },
  },
  computed: {
    ...mapState({
      userInfo: state => state.userInfo,
    }),
    ...mapGetters({
      tasks: 'task/tasks',
      l: 'l',
      platform: 'platform',
      isDesktop: 'isDesktop',
      getListTasks: 'list/getTasks',

      isListCompleted: 'list/isListCompleted',
      isListSomeday: 'list/isListSomeday',
      getListDeadlineStr: 'list/getListDeadlineStr',
      getListCalendarStr: 'list/getListCalendarStr',
    }),
    completedItem() {
      return this.isListCompleted(this.item)
    },
    canceledItem() {
      return false
    },
    copyItem() {
      this.$store.dispatch('list/duplicateList', {
        list: this.item, rootTasks: this.tasks.filter(el => !el.heading && el.list === this.item.id), headingTasks: this.tasks.filter(el => el.heading && el.list === this.item.id),
      })
    },
    
    progressIcon() {
      return this.isSomeday ? 'pie-someday' : 'pie'
    },
    circleIcon() {
      return this.isSomeday ? 'circle-check-dash' : 'circle-check'
    },
    isSomeday() {
      return this.isListSomeday(this.item)
    },
    calendarStr() {
      return this.getListCalendarStr(this.item, this.l, this.userInfo)
    },
    deadlineStr() {
      const list = this.item
      if (!list.deadline) return null
      return this.getListDeadlineStr(list, mom().format('Y-M-D'), this.l)
    },
    listTasks() {
      return this.getListTasks(this.tasks, this.item.id)
    },
    listTasksLength() {
      return this.listTasks.length
    },
    getListProgress() {
      return this.$store.getters['list/pieProgress'](this.tasks, this.item.id, task => this.$store.getters['task/isTaskInList'](task, 'Completed'))
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

.List .cont-wrapper {
  height: 38px;
}

.mobile .cont-wrapper {
  height: 50px;
}

.cont-wrapper {
  position: relative;
  overflow: hidden;
}

.cont {
  display: flex;
  height: 100%;
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
  margin-right: 6px;
}

.icon-wrapper {
  width: 35px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.progress-icon {
  opacity: .6;
  transform: translate(2px, 2px) scale(1,1);
  transition-duration: .2s;
}

.progress-icon:hover {
  transform: translate(2px, 2px) scale(1.05,1.05);
}

.list-inf {
  margin-left: 4px;
  margin-right: 4px;
  font-size: .8em;
  white-space: nowrap;
}

.icon {
  transform: translateY(2px);
}

.fade {
  opacity: .6;
}

.deadline {
  white-space: nowrap;
  color: var(--red);
}

.completed {
  opacity: .4;
}

.sortable-drag {
  background-color: var(--light-gray) !important; 
  border-radius: 6px;
}

.sortable-ghost .cont {
  display: none;
}

.sortable-ghost .cont-wrapper {
  background-color: var(--sidebar-color) !important;
  transition-duration: 0;
  height: 38px;
  padding: 0;
}

.mobile.sortable-ghost .cont-wrapper {
  height: 50px;
}

.list-trans-leave-active, .list-trans-enter-active {
  transition-duration: .25s !important;
}

.list-trans-leave, .list-trans-leave .cont-wrapper {
  height: 38px;
  opacity: 1;
}

.mobile .list-trans-leave, .list-trans-leave .cont-wrapper {
  height: 50px;
}

.list-trans-leave-to, .list-trans-leave-to .cont-wrapper {
  height: 0px !important;
  opacity: 0 !important;
  overflow: hidden !important;
}

.isItemMainSelection .cont-wrapper {
  background-color: var(--light-gray);
}

.isItemSelected.isItemMainSelection .cont-wrapper,
.isItemSelected:hover .cont-wrapper {
  background-color: rgba(53, 73, 90, 0.9) !important;
}

.isItemSelected .cont-wrapper {
  background-color: rgba(53, 73, 90, 0.6) !important;
  box-shadow: 1px 0 1px rgba(53, 73, 90, 0.1);
  transition-duration: .8s;
}

.isItemSelected.isItemMainSelection .cont-wrapper,
.isItemSelected:hover .cont-wrapper {
  background-color: rgba(53, 73, 90, 0.9) !important;
}

</style>
