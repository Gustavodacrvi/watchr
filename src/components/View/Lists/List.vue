<template>
  <transition
    appear
    :css='false'
    @enter='enter'
    @leave='leave'
  >
    <div class="List" :class="[layout, {completed: completed || canceled, isItemMainSelection, isItemSelected}]"
      @mouseenter="onHover = true"
      @mouseleave="onHover = false"
    >
      <CommentCounter v-if="item.group && isDesktopBreakPoint && !isEditing"
        :hover='onHover'
        :number='nonReadComments'
        :isOwner='isGroupOwner'
        :assigned='item.assigned'
        :groupId='item.group'
        @assign="assignItem"
        @comment="commentsPopup"
        @mouseenter.native='onHover = true'
      />
      <div v-if="doneTransition && !isEditing && !isDesktopBreakPoint"
        class="back rb"
        ref='back'
        :style="{height: (itemHeight - 5) + 'px'}"
      >
        <div class="back-icons-wrapper">
          <Icon class="back-icon"
            icon='circle-filled'
            color='white'
            width="12px"
          />
          <Icon class="back-icon"
            icon='circle-filled'
            color='white'
            width="12px"  
          />
        </div>
      </div>
      <div
        class="cont-wrapper item-handle rb"
        :class='{doneTransition}'
        ref="cont-wrapper"
        :style="{right: right + 'px'}"

        @mouseup='stopMouseUp'
        @pointerdown='pointerdown'
        @pointerup.stop
        @touchcancel.stop
        
        @touchstart.passive='touchStart'
        @touchmove.passive='touchmove'
        @touchend.passive='touchEnd'

        @click.stop="click"
      >
        <div class="cont">
          <div class="icon-wrapper" :class="{fade: !onHover}"
            @click.stop="desktopComplete"
            @contextmenu.stop.prevent='desktopCancel'
            
            @touchstart.passive='checkTouchStart'
            @touchend.passive='touchComplete'
          >
            <ListIcons class="check-icon icon"
              :co='completed'
              :se='isSelecting'
              :ca='canceled'
              :ac='isItemSelected'
              :so='isSomeday'
              :progress='getListProgress'
            />
          </div>
          <div class="name">
            <div v-if="!isEditing" class="list-name-wrapper">
              <transition
                appear
                @enter='infoEnter'
                @leave='infoLeave'
              >
                <span v-if="showCheckDate" class="check-date" ref='check-name'>{{ showCheckDate }}</span>
              </transition>
              {{ item.name }}
              <span v-if="listTasksLength" class="list-inf fade">{{ listTasksLength }}</span>
            </div>
            <input v-else class="input"
              v-model="name"

              ref='input'
              @keydown="keydown"
            />
          </div>
          <transition name="fade-t">
            <div v-show="!isEditing" class="info">
              <template>
                <Icon v-if="deadlineStr" class="deadline list-inf icon"
                  icon='deadline'
                  width='12px'
                />
                <span v-if="deadlineStr" class='list-inf deadline'>{{ deadlineStr }}</span>
              </template>
              <span v-if="calendarStr" class="list-inf">{{ calendarStr }}</span>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>

import utils from "@/utils"
import utilsList from "@/utils/list"

import ListEdit from "./Edit.vue"
import ListIcons from './ListIcons.vue'
import CommentCounter from '@/components/View/RenderComponents/CommentCounter.vue'

import { mapGetters, mapState, mapActions } from 'vuex'

import mom from 'moment'

const tod = mom()
const TOD_DATE = tod.format('Y-M-D')

import ListItemMixin from "@/mixins/listItem"

export default {
  mixins: [ListItemMixin],
  components: {
    ListIcons,
    ListEdit, CommentCounter,
  },
  props: ['item', 'itemHeight'],
  data() {
    return {
      isEditing: false,
      doneTransition: false,
      name: this.item.name,

      options: [],
    }
  },
  mounted() {
    this.getListOptions()
  },
  beforeDestroy() {
    window.removeEventListener('pointerdown', this.hide)
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
    
    keydown(evt) {
      const {key} = evt

      if (key === "Escape")
        this.hide()
      else if (key === 'Enter') {
        this.saveList({
          name: this.name,
        })
        this.hide()
      }

    },
    enter(el, done) {
      const cont = this.$refs['cont-wrapper']
      if (cont) {
        this.doneTransition = false
        const s = cont.style

        if (this.isDesktopBreakPoint) {
          s.transitionDuration = '0s'
          s.opacity = 0
          s.height = 0
          
          requestAnimationFrame(() => {
            s.transitionDuration = '.15s'
            s.opacity = 1
            s.height = this.itemHeight + 'px'
            setTimeout(() => this.doneTransition = true, 155)
            done()
          })
        }
      }
    },
    hide() {
      this.isEditing = false
      this.name = this.item.name
      window.removeEventListener('pointerdown', this.hide)
    },
    focus() {
      setTimeout(() => this.$refs.input.focus())
    },
    click() {
      if (this.isDesktopBreakPoint && !this.isSelecting) {
        this.isEditing = true
        window.addEventListener('pointerdown', this.hide)
      }
    },
    leave(el, done) {
      this.doneTransition = false

      const s = el.style

      s.transitionDuration = 0
      s.height = this.itemHeight + 'px'
      s.opacity = 1

      requestAnimationFrame(() => {
        s.transitionDuration = '.15s'
        s.opacity = 0
        s.height = 0

        setTimeout(() => {
          this.doneTransition = true
          done()
        }, 250)
      })

    },
    saveList(obj) {
      this.$store.dispatch('list/saveList', {
        id: this.item.id,
        ...obj,
      })
    },
    save(obj) {
      this.saveList(obj)
      this.isEditing = false
    },
    completeList() {
      if (!this.completed)
        this.$store.dispatch('list/completeLists', [this.item])
      else this.$store.dispatch('list/uncompleteLists', [this.item])
    },
    assignUser(uid) {
      this.$store.dispatch('list/saveList', {
        id: this.item.id,
        assigned: uid,
      })
    },

    async getListOptions() {
      this.options = await this.getOptions(utilsList.listOptions(this, this.item))
      if (this.item.group) {
        this.options.splice(1, 0, {
          name: 'Add comments',
          icon: 'comment',
          callback: this.commentsPopup,
        })
        if (this.isGroupOwner)
          this.options.splice(2, 0, this.assignUserProfiles)
      }
    },
  },
  computed: {
    ...mapGetters({
      tasks: 'task/tasks',
      layout: 'layout',
      isDesktopBreakPoint: 'isDesktopBreakPoint',
      getListTasks: 'list/getTasks',

      isListCompleted: 'list/isListCompleted',
      isRecurringList: 'list/isRecurringList',
      isListSomeday: 'list/isListSomeday',
      isListCanceled: 'list/isListCanceled',
      getListDeadlineStr: 'list/getListDeadlineStr',
      getListCalendarStr: 'list/getListCalendarStr',
    }),
    completedItem() {
      return this.isListCompleted(this.item)
    },
    canceledItem() {
      return this.isListCanceled(this.item)
    },
    copyItem() {
      this.$store.dispatch('list/duplicateList', {
        list: this.item, rootTasks: this.tasks.filter(el => !el.heading && el.list === this.item.id), headingTasks: this.tasks.filter(el => el.heading && el.list === this.item.id),
      })
    },
    
    progressIcon() {
      return this.isSomeday ? 'pie-someday' : 'pie'
    },
    showCheckDate() {
      const n = this.viewName
      if (!(this.canceled || this.completed) || (!this.item.checkDate && !this.item.completeDate) || n === 'Completed' || n === 'Logbook' || n === 'Canceled')
        return null
      return utils.getHumanReadableDate(this.item.checkDate || this.item.completeDate)
    },
    circleIcon() {
      return this.isSomeday ? 'circle-check-dash' : 'circle-check'
    },
    isSomeday() {
      return this.isListSomeday(this.item)
    },
    calendarStr() {
      if (this.disableCalendarStr)
        return null
      const c = this.item.calendar
      if (c && this.isRecurringList(this.item) && !this.isDesktopBreakPoint)
        return null
      const res = this.getListCalendarStr(this.item, this.userInfo)
      if (res === 'Someday') return null
      return res
    },
    deadlineStr() {
      const list = this.item
      if (!list.deadline || this.disableDeadlineStr) return null
      return this.getListDeadlineStr(list, TOD_DATE)
    },
    listTasks() {
      return this.getListTasks(this.item.id)
    },
    listTasksLength() {
      return this.listTasks.length
    },
    getListProgress() {
      return this.$store.getters['list/pieProgress'](this.item.id)
    },
  },
  watch: {
    list() {
      this.getListOptions()
    },
    isEditing() {
      if (this.isEditing)
        this.focus()
    },
  },
}

</script>

<style scoped>

.List {
  position: relative;
}

.List .cont-wrapper {
  height: 38px;
}

.mobile .cont-wrapper {
  height: 50px;
}

.back-icons-wrapper {
  flex-basis: 85%;
  justify-content: space-between;
  display: flex;
}

.cont-wrapper {
  position: relative;
  overflow: hidden;
  background-color: var(--back-color);
  z-index: 6;
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

.completed-line {
  position: absolute;
  top: 50%;
  width: 0;
  transform: translateY(-50%);
  border-radius: 100px;
  border: 0 solid transparent;
  transition-duration: .15s;
}

.check-date {
  display: inline-block;
  position: relative;
  top: 3px;
  height: 100%;
  margin-right: 8px;
  color: var(--primary);
  font-size: .9em;
  overflow: hidden;
  opacity: .4;
}

.icon-wrapper {
  width: 25px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  opacity: .6;
  transform: translate(1px, 2px);
}

.progress-icon {
  opacity: .6;
  transform: translate(2px, 2px) scale(1,1);
  transition-duration: .15s;
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
  opacity: .3;
}

.deadline {
  white-space: nowrap;
  color: var(--red);
}

.check-icon {
  opacity: .4;
}

.completed {
  opacity: .4;
}

.isItemSelected .back {
  opacity: 0;
}

.input {
  outline: none;
  width: 100%;
  padding-right: 10px;
}

.back {
  position: absolute;
  left: 2px;
  top: 3px;
  background-color: var(--primary);
  width: 98%;
  z-index: 4;
  display: flex;
  align-items: center;
  opacity: 1;
  justify-content: center;
}

.sortable-drag {
  background-color: var(--light-gray) !important; 
  border-radius: 4px;
}

.sortable-ghost .cont {
  display: none;
}

.sortable-ghost .cont-wrapper {
  background-color: var(--sidebar-color) !important;
  box-shadow: inset 0 10px 8px -13px rgba(5,5,5, .7);
  transition-duration: 0;
  height: 38px;
  padding: 0;
}

.mobile.sortable-ghost .cont-wrapper {
  height: 50px;
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
