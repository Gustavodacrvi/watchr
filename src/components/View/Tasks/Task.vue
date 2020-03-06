<template>
  <transition
    appear
    :css="false"
    @enter='taskEnter'
    @leave='taskLeave'
  >
    <div class="Task draggable" :class="[{isItemSelected, showingIconDropContent: showingIconDropContent || isEditing, schedule: schedule && !isEditing, isItemMainSelection}, deviceLayout, isLogbookTask]"
      @mouseenter="onHover = true"
      @mouseleave="onHover = false"
    >
      <transition name="fade-t">
        <Timeline v-if="schedule && !isEditing"
          v-bind="schedule"
          @change-time='changeTime'
        />
      </transition>
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
                      <span v-if="logStr" class="check-date" ref='check-name'>{{ logStr }}</span>
                    </transition>

                    <Icon v-if="isToday && !isEvening" class="name-icon" icon="star" color="var(--yellow)"/>
                    <Icon v-else-if="isToday && isEvening" class="name-icon" icon="moon" color="var(--dark-purple)"/>
                    <Icon v-else-if="isTomorrow && !disableCalendarStr" class="name-icon" icon="sun" color="var(--orange)"/>
                    <Icon v-if="isTaskOverdue" class="name-icon" icon="star" color="var(--red)"/>
                    <span v-else-if="deadlineStr" class="txt-str alert">{{ deadlineStr }}</span>
                    <span v-else-if="calendarStr && !isToday && !isTomorrow" class="txt-str dark rb">{{ calendarStr }}</span>

                    <div class="parsed-wrapper">
                      <span v-html="parsedName" ref='parsed-name'></span>
                    </div>
                    <Icon v-if="haveChecklist"
                    class="txt-icon checklist-icon"
                    icon="pie"
                    color="var(--fade)"
                    width="8px"
                    :progress='checklistPieProgress'/>
                    <span v-if="!isDesktopBreakPoint && nonReadComments" class="comment-icon">
                      <Icon
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
                <span v-if="taskDuration && !schedule" class="tag dark rb">{{ taskDuration }}</span>
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
import Timeline from './Timeline.vue'
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
  props: ['item', 'hideFolderName', 'hideListName', 'showHeadingName', 'itemHeight', 'disableDeadlineStr', 'disableCalendarStr', 'allowLogStr', 'isRoot', 'itemCompletionCompareDate', 'scheduleObject', 'changingViewName',
  'selectEverythingToggle', 'hideGroupName'],
  components: {
    CommentCounter,
    Timeline, TaskIcons,
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
        co.transform = 'translateX(-27px)'
        this.deselectItem()
        requestAnimationFrame(() => {
          c.transitionDuration = '.25s'
          co.transitionDuration = '.25s'
          inf.transitionDuration = '.25s'
          c.opacity = .25
          inf.opacity = 1
          co.transform = 'translateX(0px)'
          setTimeout(() => {
            this.doneTransition = true
          }, 254)
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
          c.transitionDuration = '.25s'
          co.transitionDuration = '.25s'
          inf.transitionDuration = '.25s'
          c.opacity = 0
          inf.opacity = 0
          co.transform = 'translateX(-27px)'
          setTimeout(() => {
            this.doneTransition = true
          }, 252)
        })
      } else {
        el.style.transitionDuration = '.25s'
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
          cn.transitionDuration = '.25s'
          cn.opacity = 0
        }
        s.transitionDuration = '.25s'
        s.opacity = 0
        s.height = 0
        s.minHeight = 0

        setTimeout(() => {
          this.completeAnimation = false
          done()
        }, 253)
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
        if (!(this.changingViewName && !this.isDesktopDevice)) {
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
              cn.transitionDuration = '.25s'
              cn.opacity = 1
            }
            s.transitionDuration = '.25s'
            s.opacity = 1
            s.height = this.itemHeight + 'px'
            s.minHeight = this.itemHeight + 'px'
            done()
          })
          setTimeout(() => {
            s.transitionDuration = '.3s'
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
    addPriority(pri) {
      this.$store.dispatch('task/saveTask', {
        id: this.item.id,
        priority: pri,
      })
    },
    saveCalendarDate(calendar) {
      this.$store.dispatch('task/saveTasksById', {
        ids: [this.item.id],
        task: {calendar},
      })
    },
    assignUser(uid) {
      this.saveTaskContent({
        assigned: uid,
      })
    },
    saveDate(date) {
      this.$store.dispatch('task/saveTask', {
        id: this.item.id,
        calendar: {
          type: 'specific',
          time: null,
          editDate: TOD_DATE,
          begins: TOD_DATE,

          specific: date,
        },
      })
    },
  },
  computed: {
    ...mapGetters({
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
    }),
    isItemLogged() {
      return this.isTaskInLogbook(this.item)
    },
    options() {
      const {c,t} = this.getTask
      const dispatch = this.$store.dispatch
      const logbook = this.isItemLogged
      const arr = [
        {
          name: 'Pomo this task',
          icon: 'pomo',
          callback: () => {
            this.$store.dispatch('pomo/toggle', {task: this.item, stopToggle: true})
          },
        },
        {
          name: !logbook ? 'Move to logbook' : 'Remove from logbook',
          icon: 'logbook',
          callback: () => {
            if (!logbook)
              this.$store.dispatch('task/logTasks', [this.item.id])
            else this.$store.dispatch('task/unlogTasks', [this.item.id])
          }
        },
        {
          type: 'optionsList',
          name: 'Deadline',
          options: [
            {
              icon: 'star',
              id: 'd',
              callback: () => this.saveTaskContent({deadline: mom().format('Y-M-D')}),
            },
            {
              icon: 'sun',
              id: 'çljk',
              callback: () => this.saveTaskContent({deadline: mom().add(1, 'day').format('Y-M-D')}),
            },
            {
              icon: 'calendar',
              id: 'çljkasdf',
              callback: () => ({
                comp: 'CalendarPicker',
                content: {
                  onlyDates: true,
                  noTime: true,
                  allowNull: true,
                  callback: ({specific}) => {this.saveTaskContent({
                    deadline: specific,
                  })}
                }
              })
            },
            {
              icon: 'bloqued',
              id: 'asdf',
              callback: () => this.saveTaskContent({deadline: null}),
            },
          ]
        },
        {
          type: 'optionsList',
          name: 'Defer',
          options: [
            {
              icon: 'star',
              id: 'd',
              callback: () => this.saveDate(mom().format('Y-M-D')),
            },
            {
              icon: 'sun',
              id: 'çljk',
              callback: () => this.saveDate(mom().add(1, 'day').format('Y-M-D')),
            },
            {
              icon: 'archive',
              id: 'açlkjsdffds',
              callback: () => this.saveCalendarDate({
                type: 'someday',
              })
            },
            {
              icon: 'calendar',
              id: 'çljkasdf',
              callback: () => {return {
                comp: "CalendarPicker",
                content: {callback: this.saveCalendarDate}}},
            },
            {
              icon: 'bloqued',
              id: 'asdf',
              callback: () => this.saveCalendarDate(null)
            },
          ]
        },
        {
          type: 'optionsList',
          name: 'Priority',
          options: [
            {
              icon: 'priority',
              id: 'd',
              color: 'var(--fade)',
              callback: () => this.addPriority('')
            },
            {
              icon: 'priority',
              id: 'f',
              color: 'var(--green)',
              callback: () => this.addPriority('Low priority')
            },
            {
              icon: 'priority',
              id: 'j',
              color: 'var(--yellow)',
              callback: () => this.addPriority('Medium priority')
            },
            {
              icon: 'priority',
              id: 'l',
              color: 'var(--red)',
              callback: () => this.addPriority('High priority')
            },
          ],
        },
        {
          name: 'Copy task',
          icon: 'copy',
          callback: () => this.copyItem()
        },
        {
          name: 'Move to list',
          icon: 'tasks',
          callback: () => this.listOptions
        },
        {
          name: 'Convert to list',
          icon: 'tasks',
          callback: () => {
            const existingList = this.savedLists.find(l => l.name === this.item.name)
            if (existingList)
              this.$store.commit('pushToast', {
                name: 'There is already another list with this name.',
                seconds: 3,
                type: 'error',
              })
            else
              dispatch('task/convertToList', {task: this.item, savedLists: this.savedLists})
          }
        },
        {
          name: 'Move to folder',
          icon: 'folder',
          callback: () => this.folderOptions
        },
        {
            name: 'Delete task',
            icon: 'trash',
            important: true,
            callback: () => dispatch('task/deleteTasks', [this.item.id])
          },
      ]
      if (this.item.group) {
        arr.splice(1, 0, {
          name: 'Add comments',
          icon: 'comment',
          callback: this.commentsPopup,
        })
        if (this.isGroupOwner)
          arr.splice(2, 0, this.assignUserProfiles)
      }
      return arr
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
      
      if (!c || c.type === 'specific' || c.type === 'someday')
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
    hasTags() {
      return this.item.tags && this.item.tags.length > 0
    },
    folderOptions() {
      const links = []
      for (const fold of this.savedFolders) {
        links.push({
          name: fold.name,
          icon: 'folder',
          callback: () => {
            this.$store.dispatch('task/saveTask', {
              id: this.item.id,
              folder: fold.id,
              group: null,
              list: null,
            })
          }
        })
      }
      return {
        allowSearch: true,
        links,
      }
    },
    listOptions() {
      const moveToList = (obj) => {
        this.$store.dispatch('task/saveTask', {
          id: this.item.id,
          folder: null,
          group: null,
          ...obj
        })
      }
      const links = []
      for (const list of this.savedLists) {
        links.push({
          name: list.name,
          icon: 'tasks',
          callback: () => {
            const arr = [{
              name: 'List root',
              callback: () => moveToList({list: list.id, heading: null})
            }]
            for (const h of list.headings) {
              arr.push({
                name: h.name,
                icon: 'heading',
                callback: () => moveToList({list: list.id, heading: h.id})
              })
            }
            return arr
          }
        })
      }
      return {
        allowSearch: true,
        links,
      }
    },
    isOverdue() {
      if (this.viewName === 'Overdue') return false
      return false
    },
    isToday() {
      if (this.viewName === 'Today' || this.viewName === 'Calendar') return false
      return this.isTaskInView(this.item, 'Today')
    },
    isTaskOverdue() {
      if (this.viewName === 'Today') return false
      return this.isTaskInView(this.item, 'Overdue')
    },
    isTomorrow() {
      if (this.viewName === 'Tomorrow' || this.viewName === 'Today' || this.viewName === 'Calendar') return false
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
      if (!c || !c.evening || this.viewName === 'Today')
        return false
      return true
    },
    calendarStr() {
      const {t,c} = this.getTask
      if ((!c || c.type === 'someday') || this.disableCalendarStr || !this.isRoot) return null
      if (c.type !== 'someday' && c.type !== 'specific' && !this.isDesktopBreakPoint)
        return null
      const str = utils.parseCalendarObjectToString(c, this.userInfo)
      if (str === this.viewNameValue || (str === 'Today' && this.viewName === 'Calendar')) return null
      return str
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
      if (!c || c.type === 'someday' || c.type === 'specific')
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
    schedule() {
      if (this.scheduleObject)
        return this.scheduleObject[this.item.id]
      return null
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
  transition-duration: .25s;
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
  transition-duration: .25s;
}

.schedule.mobile {
  margin-left: 60px;
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
  padding: 6px;
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
  margin-right: 8px;
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

</style>
