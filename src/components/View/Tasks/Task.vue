<template>
  <transition
    appear
    :css="false"
    @enter='taskEnter'
    @leave='taskLeave'
  >
    <div class="Task draggable" :class="[{isItemSelected, showingIconDropContent: showingIconDropContent || isEditing, isItemMainSelection}, deviceLayout, isLogbookTask]"
      @mouseenter="onHover = true"
      @mouseleave="onHover = false"
    >
      <CommentCounter v-if="item.group && isDesktopBreakPoint && !isEditing"
        ref="comment-counter"
        :hover='onHover'
        :number='nonReadComments'
        :isOwner='isGroupOwner'
        :assigned='item.assigned'
        :groupId='item.group'
        @assign="assignItem"
        @comment="commentsPopup"
        @mouseenter.native='onHover = true'
      />
      <div v-if="doneTransition && !isEditing && !isDesktopDevice"
        class="back rb"
        ref='back'
        :style="{height: (itemHeight - 5) + 'px'}"
      >
        <div class="back-icons-wrapper">
          <Icon class="back-icon"
            icon='circle-filled'
            color='white'
            width="16px"
          />
          <Icon class="back-icon"
            icon='circle-filled'
            color='white'
            width="16px"  
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
      >
        <transition
          @enter='enter'
          @leave='leave'
        >
          <div v-if="!isEditing" key="notediting"
            class="cont-wrapper-wrapper rb task-cont-wrapper"
            :class="layout"
            @click="click"
            :style='{height: itemHeight + "px"}'
          >
            <div class="cont"
              ref='cont'
            >
              <transition name='ruler-t'>
                <div v-if="computedShowRuler"
                  class="ruler-element"
                  @click='rulerClick'
                >
                  <div class="element-wrapper">
                    <span v-if='startHour'
                      class="timeline-time"
                    >
                      <span class="hour">
                        {{startHour}}
                      </span>
                      <span class="timeline-info">
                        <span>
                          {{startMin}}
                        </span>
                        <span class="pm-am">
                          {{timePmAm}}
                        </span>
                      </span>
                    </span>
                    <span v-else class='timeline-line'>
                      
                    </span>
                  </div>
                </div>
              </transition>
              <div class="check" ref='check'
                :class="{changeColor}"

                @click.stop="desktopComplete"
                @contextmenu.prevent.stop='desktopCancel'

                @touchstart.passive='checkTouchStart'
                @touchend.passive='touchComplete'
              >
                <TaskIcons
                  :co='completed'
                  :color='circleColor'
                  :re='isRepeatingTask'
                  :se='isSelecting'
                  :ac='isItemSelected'
                  :ca='canceled'
                  :so='isSomeday'
                  :animation='completeAnimation'
                />
              </div>
              <div class="text"
                :class="{changeColor}"
              >
                <div class="task-name-wrapper">
                  <span class="task-name" key="normal">
                    <span class="completed-line" ref='completed-line'></span>
                    <transition
                      appear
                      @enter='infoEnter'
                      @leave='infoLeave'
                    >
                      <span v-if="showCheckDate" class="check-date" ref='check-name'>{{ showCheckDate }}</span>
                    </transition>
                    <transition
                      appear
                      @enter='infoEnter'
                      @leave='infoLeave'
                    >
                      <span v-if="logStr && !showCheckDate" class="check-date" ref='check-name'>{{ logStr }}</span>
                    </transition>
                    
                    <transition-group
                      appear
                      @enter='infoEnter'
                      @leave='infoLeave'
                      tag='span'
                    >
                      <Icon v-if="isInbox" class="name-icon" icon="inbox" color="var(--primary)" key='1'/>
                      <Icon v-if="isToday && !isEvening" class="name-icon" icon="star" color="var(--yellow)" key='1'/>
                      <Icon v-else-if="isToday && isEvening" class="name-icon" icon="moon" color="var(--dark-purple)" key='2'/>
                      <Icon v-else-if="isTomorrow && !disableCalendarStr" class="name-icon" icon="sun" color="var(--orange)" key='3'/>
                      <Icon v-if="isTaskOverdue" class="name-icon" icon="star" color="var(--red)" key='4'/>
                      <template v-else>
                        <span v-if="deadlineStr" class="txt-str alert" key='5'>{{ deadlineStr }}</span>
                        <span v-if="calendarStr && !isToday && !isTomorrow" class="txt-str dark rb" key='6'>
                          {{ calendarStr }}
                        </span>
                      </template>
                    </transition-group>

                    <div class="parsed-wrapper">
                      <span v-html="parsedName" ref='parsed-name'></span>
                    </div>
                    
                    <span v-if="!computedShowRuler && timeStr" class="txt-icon tag dark rb">{{ timeStr }}</span>
                    <Icon v-if="haveChecklist"
                    class="txt-icon checklist-icon"
                    icon="pie"
                    color="var(--fade)"
                    width="8px"
                    :progress='checklistPieProgress'/>
                    <span v-if="!isDesktopBreakPoint && nonReadComments" class="comment-icon">
                      <Icon class='str-icon'
                        icon='comment'
                        width="14px"
                      />
                      <span class="comm-num">
                        {{nonReadComments}}
                      </span>
                    </span>
                    <Icon v-if="hasTags" class="txt-icon" icon="tag" color="var(--fade)" width="14px"/>
                    <Icon v-if="haveFiles" class="txt-icon" icon="file" color="var(--fade)" width="14px"/>
                    <span v-if="nextCalEvent" class="txt-icon tag dark rb">{{ nextCalEvent }}</span>
                  </span>
                </div>
              </div>
              <span class="info" ref='info'>
                <span v-if="folderStr" class="tag dark rb">{{ folderStr }}</span>
                <span v-if="groupStr" class="tag dark rb">{{ groupStr }}</span>
                <span v-if="listStr" class="tag dark rb">{{ listStr }}</span>
                <span v-if="headingName && showHeadingName" class="tag dark rb">{{ headingName }}</span>
                <span v-if="taskDuration" class="tag dark rb">{{ taskDuration }}</span>
              </span>
            </div>
          </div>
          <div v-else-if="isEditing" key="editing">
            <Edit class="handle" @pointerdown.native.stop
              placeholder="Task name..."
              notesPlaceholder="Notes..."
              btnText="Save task"
              :defaultTask='item'
              :defaultFiles='item.files || []'
              :taskHeight='itemHeight'
              :showCancel='true'
              :editAction='editAction'
              @done-action='editAction = null'
              @cancel='editCancel'
              @save='saveTask'
            />
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>

<script>

import IconDropVue from '../../IconDrop/IconDrop.vue'
import TagVue from '../Tag.vue'
import EditVue from './Edit.vue'
import TaskIcons from './TaskIcons.vue'
import CommentCounter from '@/components/View/RenderComponents/CommentCounter.vue'

import { mapState, mapGetters } from 'vuex'

import utilsTask from '@/utils/task'
import utilsMoment from '@/utils/moment'
import utils from '@/utils/index'

import mom from 'moment'

const tod = mom()

const TOD_DATE = tod.format('Y-M-D')

import ListItemMixin from "@/mixins/listItem"

export default {
  mixins: [ListItemMixin],
  props: ['item', 'hideFolderName', 'hideListName', 'showHeadingName', 'itemHeight', 'disableDeadlineStr', 'disableCalendarStr', 'allowLogStr', 'isRoot', 'itemCompletionCompareDate', 'showingRuler', 'timelineIncrement',
  'selectEverythingToggle', 'hideGroupName'],
  components: {
    CommentCounter,
    TaskIcons,
    IconDrop: IconDropVue,
    Edit: EditVue,
    Tag: TagVue,
  },
  data() {
    return {
      showingIconDropContent: false,
      isEditing: false,
      justSaved: false,
      doneTransition: false,

      editAction: null,
    }
  },
  methods: {
    dispatchCompleteItem() {
      this.$store.dispatch('task/completeTasks', [this.item])
    },
    dispatchUncompleteItem() {
      this.$store.dispatch('task/uncompleteTasks', [this.item])
    },
    dispatchCancelItem() {
      this.$store.dispatch('task/cancelTasks', [this.item.id])
    },
    dispatchUncancelItem() {
      this.$store.dispatch('task/uncancelTasks', [this.item.id])
    },
    copyItem() {
      this.$store.dispatch('task/copyTask', this.item)
    },

    rulerClick() {
      if (!this.isSelecting)
        this.selectItem()
    },

    enter(el) {
      if (!this.isEditing) {
        const co = el.style
        const inf = this.$refs['info'].style
        const c = this.$refs['check'].style
        this.doneTransition = false

        c.transitionDuration = 0
        co.transitionDuration = 0
        inf.transitionDuration = 0
        c.opacity = 0
        inf.opacity = 0
        co.transform = `translateX(-${this.computedShowRuler ? 62 : 27}px)`
        this.deselectItem()
        requestAnimationFrame(() => {
          c.transitionDuration = '.2s'
          co.transitionDuration = '.2s'
          inf.transitionDuration = '.2s'
          c.opacity = .25
          inf.opacity = 1
          co.transform = 'translateX(0px)'
          setTimeout(() => {
            this.doneTransition = true
          }, 155)
        })
      }
    },
    leave(el) {
      if (this.isEditing) {
        const co = el.style
        const inf = this.$refs['info'].style
        const c = this.$refs['check'].style
        this.doneTransition = false

        c.transitionDuration = 0
        co.transitionDuration = 0
        inf.transitionDuration = 0
        c.opacity = .25
        inf.opacity = 1
        co.transform = 'translateX(0px)'
        requestAnimationFrame(() => {
          c.transitionDuration = '.2s'
          co.transitionDuration = '.2s'
          inf.transitionDuration = '.2s'
          c.opacity = 0
          inf.opacity = 0
          co.transform = `translateX(-${this.computedShowRuler ? 62 : 27}px)`
          setTimeout(() => {
            this.doneTransition = true
          }, 152)
        })
      } else {
        el.style.transitionDuration = '.2s'
      }
    },
    editCancel() {
      this.isEditing = false
      this.onHover = false
    },
    taskLeave(el, done) {
      const hasBeenDroppedOnSidebar = this.$parent.droppedIds.includes(this.item.id)
      
      this.doneTransition = false
      const back = this.$refs['back']
      let cn = this.$refs['comment-counter']
      if (cn)
        cn = cn.$el.style
      if (back) back.style.display = 'none'
      const s = this.$refs['cont-wrapper'].style
      let l
      let n
      if (this.completeAnimation) {
        l = this.$refs['completed-line'].style
        n = this.$refs['parsed-name'].style
      }
      
      s.opacity = hasBeenDroppedOnSidebar ? 0 : 1
      if (cn) {
        cn.transitionDuration = '0s'
        cn.opacity = 1
      }
      s.transitionDuration = '0s'
      if (this.completeAnimation) {
        l.transitionDuration = '0s'
        n.transitionDuration = '0s'
        l.width = 0
        l.border = '0 solid transparent'
        n.opacity = 1
      }
      s.height = this.itemHeight + 'px'
      s.minHeight = this.itemHeight + 'px'

      const hideTask = () => {
        if (cn) {
          cn.transitionDuration = '.2s'
          cn.opacity = 0
        }
        s.transitionDuration = '.2s'
        s.opacity = 0
        s.height = 0
        s.minHeight = 0

        setTimeout(() => {
          this.completeAnimation = false
          done()
        }, 153)
      }
      
      requestAnimationFrame(() => {
        if (!this.completeAnimation) {
          hideTask()
        } else {
          l.transitionDuration = `.2s`
          n.transitionDuration = `.2s`

          l.width = '100%'
          l.border = '2px solid var(--txt)'

          n.opacity = '.4'

          this.waitForAnotherItemComplete(hideTask)
        }
        
      })
    },
    taskEnter(el, done) {
      const cont = this.$refs['cont-wrapper']
      const parentIds = this.$parent.disableItemEnterTransitionIds
      
      let disableTransition = false
      if (parentIds.includes(this.item.id)) {
        const i = parentIds.findIndex(id => id === this.item.id)
        parentIds.splice(i, 1)
        disableTransition = true
      }
      this.doneTransition = false
      if (cont) {
        const s = cont.style
        let cn = this.$refs['comment-counter']
        if (cn)
          cn = cn.$el.style

        setTimeout(() => {
          this.doneTransition = true
          done()
        }, 300)
        if (!(!this.isDesktopDevice)) {
          s.transitionDuration = '0s'
          s.opacity = 0
          s.height = 0
          s.minHeight = 0
          if (cn) {
            cn.transitionDuration = '0s'
            cn.opacity = 0
          }
          
          requestAnimationFrame(() => {
            if (cn) {
              cn.transitionDuration = disableTransition ? 0 : '.2s'
              cn.opacity = 1
            }
            s.transitionDuration = disableTransition ? 0 : '.2s'
            s.opacity = 1
            s.height = this.itemHeight + 'px'
            s.minHeight = this.itemHeight + 'px'
            done()
          })
          setTimeout(() => {
            s.transitionDuration = '.2s'
            s.height = 'auto'
            s.minHeight = this.itemHeight + 'px'
          }, 300)
        }
      }
    },
    changeTime(obj) {
      this.$emit('change-time', {
        ...obj,
        from: this.item.id,
      })
    },
    click() {
      if (this.isDesktopDevice && !this.isSelecting && !this.isLogbookTask)
        this.isEditing = true
    },
    saveTaskContent(obj) {
      this.$store.dispatch('task/saveTask', {
        id: this.item.id,
        ...obj,
      })
    },
    saveTask(obj, force) {
      this.justSaved = true
      setTimeout(() => {
        this.justSaved = false
      }, 100)
      this.saveTaskContent(obj)
      if (!obj.handleFiles || force)
        this.isEditing = false
    },
    assignUser(uid) {
      this.saveTaskContent({
        assigned: uid,
      })
    },
    saveNewCalendarTime() {
      if (this.incrementedTime)
        this.saveTaskContent({
          calendar: {
            ...this.item.calendar,
            time: this.incrementedTime,
          },
        })
    },
  },
  computed: {
    ...mapGetters({
      calendarDate: 'calendarDate',
      isDesktopBreakPoint: 'isDesktopBreakPoint',
      isDesktopDevice: 'isDesktopDevice',
      layout: 'layout',
      deviceLayout: 'deviceLayout',
      fallbackSelected: 'fallbackSelected',
      isTaskCompleted: 'task/isTaskCompleted',
      isTaskCanceled: 'task/isTaskCanceled',
      isTaskInLogbook: 'task/isTaskInLogbook',
      getTaskDeadlineStr: 'task/getTaskDeadlineStr',
      isTaskInView: 'task/isTaskInView',
      getListsById: 'list/getListsById',
      isRecurringTask: 'task/isRecurringTask',
      savedLists: 'list/sortedLists',
      savedFolders: 'folder/sortedFolders',
      savedTags: 'tag/sortedTagsByName',
      getTagsById: 'tag/getTagsById',
    }),
    computedShowRuler() {
      return this.showingRuler && this.calendarDate
    },
    isItemLogged() {
      return this.isTaskInLogbook(this.item)
    },
    options() {
      return utilsTask.taskOptions(this.item, this)
    },
    isRepeatingTask() {
      return this.isRecurringTask(this.item)
    },
    completedItem() {
      return this.isTaskCompleted(this.item, TOD_DATE, this.itemCompletionCompareDate)
    },
    canceledItem() {
      return this.isTaskCanceled(this.item)
    },
    
    checklistPieProgress() {
      const c = this.item.calendar
      let completed
      
      if (!c || !this.isRepeatingTask)
        completed = this.item.checklist.reduce((acc, opt) => opt.completed ? acc + 1 : acc, 0)
      else {
        const compareDate = utilsMoment.getNextEventAfterCompletionDate(c).format('Y-M-D')
        
        completed = this.item.checklist.reduce((acc, opt) => {
          if (!compareDate)
            return opt.completed ? acc + 1 : acc
          if (!opt.completeDate)
            return false

          return (opt.completed && mom(opt.completeDate, 'Y-M-D').isSameOrAfter(mom(compareDate, 'Y-M-D'), 'day')) ? acc + 1 : acc
        }, 0)
      }

      return 100 * completed / this.item.checklist.length
    },
    parsedName() {
      return utils.parseHTMLStr(this.item.name)
    },
    isSomeday() {
      const {c} = this.getTask
      return c && c.type === 'someday'
    },
    haveChecklist() {
      return this.item.checklist && this.item.checklist.length > 0
    },
    haveFiles() {
      return this.item.files && this.item.files.length > 0
    },
    tagNames() {
      return this.getTagsById(this.item.tags || []).map(el => el.name)
    },
    hasTags() {
      if (this.viewType === 'tag' && this.tagNames.length === 1)
        return this.tagNames[0] !== this.viewName
      return this.item.tags && this.item.tags.length > 0
    },
    isInbox() {
      if (this.viewName === 'Inbox')
        return false
      return !this.item.calendar
    },
    isToday() {
      if (this.isCalendarView) return false
      return this.isTaskInView(this.item, 'Today')
    },
    isTaskOverdue() {
      return this.isTaskInView(this.item, 'Overdue')
    },
    isTomorrow() {
      if (this.isCalendarView) return false
      return this.isTaskInView(this.item, 'Tomorrow')
    },
    showIconDrop() {
      return this.isDesktopBreakPoint && this.onHover
    },
    taskList() {
      return this.savedLists.find(el => el.id === this.item.list)
    },
    itemList() {
      if (!this.item.list)
        return null
      return this.getListsById([this.item.list])[0]
    },
    listStr() {
      const list = this.item.list
      if (!list || this.hideListName) return null
      const savedList = this.itemList
      if (!savedList || (savedList.name === this.viewName)) return null
      return savedList.name
    },
    taskList() {
      if (!this.item.list)
        return null
      return this.savedLists.find(el => el.id === this.item.list)
    },
    headingName() {
      const list = this.itemList
      if (!list) return ''
      const head = list.headings.find(h => h.id === this.item.heading)
      return (head && head.name) || ''
    },
    folderStr() {
      const folder = this.item.folder
      if (!folder || this.hideFolderName) return null
      const fold = this.savedFolders.find(f => f.id === folder)
      if (!fold || (fold.name === this.viewName)) return null
      return fold.name
    },
    groupStr() {
      const group = this.item.group
      if (!group || this.hideGroupName) return null
      const fold = this.itemGroup
      if (!fold || (fold.name === this.viewName)) return null
      if (this.taskList && this.viewName === this.taskList.name) return null
      return fold.name
    },
    isEvening() {
      const c = this.item.calendar
      if (!c || !c.evening || this.isCalendarView)
        return false
      return true
    },
    isCalendarView() {
      if (this.viewType === 'calendar')
        return true
      const n = this.viewName
      return n === 'Today' || n === 'Tomorrow'
    },
    calendarStr() {
      const {t,c} = this.getTask
      if ((!c || c.type === 'someday' || c.type === 'anytime') || this.disableCalendarStr) return null

      if (this.isRepeatingTask && !this.isDesktopBreakPoint)
        return null

      const str = utils.parseCalendarObjectToString(c, this.userInfo, false, false)

      if ((c.type === 'specific' && this.viewType === 'calendar') || str === this.viewNameValue || (str === 'Today')) return null

      return str
    },
    calendarTime() {
      const c = this.item.calendar
      if (!c || !c.time) return null
      if (this.incrementedTime)
        return this.incrementedTime
      return c.time
    },
    incrementedTime() {
      if (!this.timelineIncrement || !this.isItemSelected)
        return null
      const newTime = mom(this.item.calendar.time, 'HH:mm').add(this.timelineIncrement, 'm')
      if (newTime.isValid())
        return newTime.format('HH:mm')
    },
    formatedTime() {
      if (!this.calendarTime)
        return null
      return mom(this.calendarTime, 'HH:mm').format(this.timeFormat)
    },
    timeStr() {
      if (!this.calendarTime)
        return null
      return `at ${utils.parseTime(this.calendarTime, this.userInfo)}`
    },
    timeFormat() {
      return this.userInfo.disablePmFormat ? 'HH:mm' : 'LT'
    },
    startHour() {
      if (!this.formatedTime)
        return null

      return mom(this.timeNumbers, 'HH:mm').format('HH')
    },
    timeNumbers() {
      if (!this.formatedTime)
        return null
      if (this.userInfo.disablePmFormat)
        return this.formatedTime
      return this.formatedTime.split(' ')[0]
    },
    timePmAm() {
      if (!this.formatedTime || this.userInfo.disablePmFormat)
        return null
      const split = this.formatedTime.split(' ')
      return split[split.length - 1]
    },
    startMin() {
      if (!this.calendarTime)
        return null
      return mom(this.calendarTime, 'HH:mm').format('mm')
    },
    isLogbookTask() {
      return this.item.logDate
    },
    logStr() {
      if (!this.allowLogStr || !this.item.logDate) return null
      return utils.getHumanReadableDate(this.item.logDate)
    },
    deadlineStr() {
      if (this.disableDeadlineStr)
        return null
      return this.getTaskDeadlineStr(this.item, tod.format('Y-M-D'))
    },
    showCheckDate() {
      const n = this.viewName
      if (!(this.canceled || this.completed) || (!this.item.checkDate && !this.item.completeDate) || n === 'Logbook' || n === 'Logbook' || n === 'Canceled')
        return null
      return utils.getHumanReadableDate(this.item.checkDate || this.item.completeDate)
    },
    nextCalEvent() {
      const {t,c} = this.getTask
      if (!c || !this.isRepeatingTask)
        return null

      const nextEventAfterCompletion = utilsMoment.getNextEventAfterCompletionDate(c, true)

      const date = utils.getHumanReadableDate(nextEventAfterCompletion.format('Y-M-D'))
      if (!date || date === this.viewName) return null
      return "Next event" + ' ' + date
    },
    taskDuration() {
      return this.item.taskDuration ? utils.formatQuantity(this.item.taskDuration) : null
    },
    getTask() {
      return {
        t: this.item,
        c: this.item.calendar
      }
    },
    circleColor() {
      if (!this.item.priority) return ''
      const obj = {
        'Low priority': 'var(--green)',
        'Medium priority': 'var(--yellow)',
        'High priority': 'var(--red)',
      }
      return obj[this.item.priority]
    },
  },
  watch: {
    selectEverythingToggle() {
      if (this.selectEverythingToggle)
        this.selectItem()
    },
  },
}

</script>

<style scoped>

.Task {
  height: auto;
  user-select: none;
  position: relative;
  z-index: 2;
}

.ruler-element {
  width: 50px;
  flex-shrink: 0;
}

.element-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.timeline-line {
  display: block;
  height: 3px;
  width: 10px;
  border-radius: 4px;
  background-color: var(--fade);
}

.timeline-time {
  display: flex;
}

.pm-am {
  font-size: .8em;
}

.hour {
  font-size: 1.2em;
}

.timeline-info {
  font-size: .7em;
  color: var(--fade);
  margin-left: 2px;
  display: flex;
  flex-direction: column;
}

.changeColor {
  color: var(--primary) !important;
}

.Task.showingIconDropContent {
  z-index: 5;
}

.back-icons-wrapper {
  flex-basis: 85%;
  justify-content: space-between;
  display: flex;
}

.cont-wrapper {
  position: relative;
  min-height: 38px;
  z-index: 5;
  transition-duration: .2s;
}

.mobile .cont-wrapper {
  background-color: var(--back-color);
}

.cont-wrapper-wrapper {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  overflow: hidden;
}

.comment-icon {
  margin-left: 10px;
  position: relative;
}

.comm-num {
  font-size: .8em;
}

.cont-wrapper.mobile {
  min-height: 50px;
}

.completed-line {
  position: absolute;
  top: 50%;
  width: 0;
  transform: translateY(-50%);
  border-radius: 100px;
  border: 0px solid transparent;
  background-color: var(--txt);
  transition-duration: .2s;
}

.mobile .cont-wrapper {
  height: 50px;
}

.hided {
  opacity: 0;
  padding: 0;
  transition-duration: 0s;
}

.show {
  opacity: 1;
}

.dark {
  padding: 4px;
  padding-top: 5px;
  position: relative;
  top: -1px;
  background-color: var(--sidebar-color);
}

.subtasks {
  top: 100%;
  left: 0;
}

.fade {
  opacity: .4;
}

.txt-icon {
  margin-left: 12px;
  margin-right: 10px;
}

.desktop .cont-wrapper.doneTransition:hover, .desktop .cont-wrapper:active {
  background-color: var(--light-gray);
}

.str-icon {
  margin-right: 2px;
}

.isItemMainSelection .cont-wrapper {
  background-color: var(--light-gray);
}

.check, .text, .options, .cont {
  height: 100%;
}

.cont, .text, .check-drop, .check {
  display: flex;
}

.text .icon {
  flex-shrink: 0;
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
  transform: translateY(-2.5px);
  opacity: .4;
}

.info {
  flex-basis: 20px;
  margin-left: 25px;
  display: flex;
  align-items: center;
}

.check, .icon-drop-wrapper {
  justify-content: center;
  align-items: center;
}

.icon-drop-wrapper {
  position: relative;
  width: 4px;
}

.alert {
  color: var(--red);
}

.calendarStr {
  position: absolute;
  top: 50%;
  transform: translateY(-45%);
  right: -.5px;
}

.check {
  width: 25px;
  height: 100%;
  margin-left: 2px;
  flex-shrink: 0;
  transition-duration: .2s;
  opacity: .25;
}

.handle, .Task, .cont {
  outline: none;
}

.cont {
  position: relative;
}

.task-name {
  margin: 0 4px;
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
}

.parsed-wrapper {
  min-width: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  padding: 6px 0;
}

.icon {
  transform: translateY(2px);
}

.text {
  position: relative;
  align-items: center;
  flex-basis: 100%;
}

.task-name-wrapper {
  max-width: 100%;
  position: absolute;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  text-overflow: ellipsis;
  overflow: hidden;
}

.check-drop {
  flex-basis: 28px;
}

.sortable-drag {
  background-color: var(--light-gray) !important; 
  border-radius: 6px;
}

.sortable-ghost .cont {
  display: none;
}

.name-icon {
  transform: translateY(.5px);
}

.apply {
  color: var(--primary);
}

.tag {
  display: inline-block;
  padding: 5px;
  margin: 0 4px;
  font-size: .75em;
  white-space: nowrap;
}

.txt-str {
  margin-right: 9px;
  font-size: .75em;
  display: inline-flex;
  align-items: center;
}

.task-tag {
  margin-left: 2px;
  transform: scale(.8,.8);
}

.checklist-icon {
  transform: translateY(2.5px);
}

.isItemSelected .cont-wrapper {
  background-color: rgba(53, 73, 90, 0.6) !important;
  box-shadow: 1px 0 1px rgba(53, 73, 90, 0.1);
  cursor: grab;
}

.isItemSelected.isItemMainSelection .cont-wrapper,
.isItemSelected:hover .cont-wrapper {
  background-color: rgba(53, 73, 90, 0.9) !important;
}

.isItemSelected .back {
  opacity: 0;
}

.sortable-ghost {
  height: unset !important;
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

.isLogbookTask {
  opacity: .6 !important;
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

.ruler-t-enter, .ruler-t-leave-to {
  opacity: 0;
  width: 0;
  transition-duration: .2s;
}

.ruler-t-leave, .ruler-t-enter-to {
  opacity: 1;
  width: 35px;
  transition-duration: .2s;
}

</style>
