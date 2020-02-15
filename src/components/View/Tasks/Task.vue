<template>
  <transition
    appear
    :css="false"
    @enter='taskEnter'
    @leave='taskLeave'
  >
    <div class="Task draggable" :class="[{isItemSelected, showingIconDropContent: showingIconDropContent || isEditing, schedule: schedule && !isEditing, isItemMainSelection}, platform]"
      @mouseenter="onHover = true"
      @mouseleave="onHover = false"
    >
      <transition name="fade-t">
        <Timeline v-if="schedule && !isEditing"
          v-bind="schedule"
          @change-time='changeTime'
        />
      </transition>
      <CommentCounter v-if="item.group && isDesktop && !isEditing"
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
      <div v-if="doneTransition && !isEditing && !isDesktop"
        class="back rb"
        ref='back'
        :style="{height: (itemHeight - 5) + 'px'}"
      >
        <div class="back-icons-wrapper">
          <Icon class="back-icon"
            icon='circle-filled'
            color='white'
            width="22px"
          />
          <Icon class="back-icon"
            icon='circle-filled'
            color='white'
            width="22px"  
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
            :class="platform"
            @click="click"
            :style='{height: itemHeight + "px"}'
          >
            <CircleBubble v-if="!isDesktop"
              innerColor='var(--light-gray)'
              outerColor='var(--fade)'
              opacity='0'
            />
            <div class="cont"
              ref='cont'
            >
              <div class="check" ref='check'
                :class="{changeColor}"
              >
                <TaskIcons class="check-icon icon"
                  :co='completed'
                  :color='circleColor'
                  :se='isSelecting'
                  :ca='canceled'
                  :so='isSomeday'
                  @click.native.stop="desktopComplete"
                  @contextmenu.native.stop.prevent='desktopCancel'
                  
                  @touchstart.native.passive='checkTouchStart'
                  @touchend.native.passive='touchComplete'
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
                    <span v-html="parsedName" ref='parsed-name'></span>
                    <Icon v-if="haveChecklist"
                      class="txt-icon checklist-icon"
                      icon="pie"
                      color="var(--fade)"
                      width="12px"
                      :progress='checklistPieProgress'
                    />
                    <span v-if="!isDesktop && nonReadComments" class="comment-icon">
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
                    <span v-if="nextCalEvent" class="tag cb rb">{{ nextCalEvent }}</span>
                  </span>
                </div>
              </div>
              <span class="info" ref='info'>
                <Icon v-if="isTomorrow" class="name-icon" icon="sun" color="var(--orange)"/>
                <Icon v-else-if="isToday" class="name-icon" icon="star" color="var(--yellow)"/>
                <Icon v-else-if="isTaskOverdue" class="name-icon" icon="star" color="var(--red)"/>
                <span v-if="deadlineStr" class="tag alert">{{ deadlineStr }}</span>
                <span v-if="calendarStr && !isToday && !isTomorrow" class="tag cb rb">{{ calendarStr }}</span>
                <span v-if="folderStr" class="tag cb rb">{{ folderStr }}</span>
                <span v-if="groupStr" class="tag cb rb">{{ groupStr }}</span>
                <span v-if="listStr" class="tag cb rb">{{ listStr }}</span>
                <span v-if="headingName && showHeadingName" class="tag cb rb">{{ headingName }}</span>
                <span v-if="taskDuration && !schedule" class="tag cb rb">{{ taskDuration }}</span>
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

import ListItemMixin from "@/mixins/listItem"

export default {
  mixins: [ListItemMixin],
  props: ['item', 'activeTags', 'hideFolderName', 'hideListName', 'showHeadingName', 'itemHeight', 'allowCalendarStr', 'isRoot', 'itemCompletionCompareDate', 'scheduleObject', 'changingViewName',
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
      
      s.opacity = 1
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
        if (!(this.changingViewName && !this.isDesktop)) {
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
            s.transitionDuration = '0s'
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
      if (this.isDesktop && !this.isSelecting)
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
          editDate: mom().format('Y-M-D'),
          begins: mom().format('Y-M-D'),

          specific: date,
        },
      })
    },
  },
  computed: {
    ...mapGetters({
      isDesktop: 'isDesktop',
      platform: 'platform',
      fallbackSelected: 'fallbackSelected',
      isTaskCompleted: 'task/isTaskCompleted',
      isTaskCanceled: 'task/isTaskCanceled',
      getTaskDeadlineStr: 'task/getTaskDeadlineStr',
      isTaskInView: 'task/isTaskInView',
      savedLists: 'list/sortedLists',
      savedFolders: 'folder/sortedFolders',
      savedTags: 'tag/sortedTagsByName',
    }),
    options() {
      const {c,t} = this.getTask
      const dispatch = this.$store.dispatch
      const arr = [
        {
          name: 'Pomo this task',
          icon: 'pomo',
          callback: () => {
            this.$store.dispatch('pomo/toggle', {task: this.item, stopToggle: true})
          },
        },
        {
          name: !this.item.logbook ? 'Move to logbook' : 'Remove from logbook',
          icon: 'logbook',
          callback: () => {
            if (!this.item.logbook)
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
    completedItem() {
      return this.isTaskCompleted(this.item, mom().format('Y-M-D'), this.itemCompletionCompareDate)
    },
    canceledItem() {
      return this.isTaskCanceled(this.item)
    },
    
    checklistPieProgress() {
      let completed = this.item.checklist.reduce((acc, opt) => opt.completed ? acc + 1 : acc, 0)
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
      return this.isDesktop && this.onHover
    },
    taskList() {
      return this.savedLists.find(el => el.id === this.item.list)
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
    calendarStr() {
      const {t,c} = this.getTask
      if ((!c || c.type === 'someday') || (!this.allowCalendarStr && !this.isRoot)) return null
      const str = utils.parseCalendarObjectToString(c, this.userInfo)
      if (str === this.viewNameValue || (str === 'Today' && this.viewName === 'Calendar')) return null
      return str
    },
    deadlineStr() {
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
      if ((!c || c.type === 'someday') || (c.type !== 'periodic' && c.type !== 'weekly')) return null
      const nextEventAfterCompletion = utilsMoment.getNextEventAfterCompletionDate(c)

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
  background-color: var(--back-color);
  z-index: 5;
  transition-duration: .25s;
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
  border: 0 solid transparent;
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

.subtasks {
  top: 100%;
  left: 0;
}

.fade {
  opacity: .4;
}

.txt-icon {
  margin-left: 12px;
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
  width: 35px;
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
  overflow: hidden;
  text-overflow: ellipsis;
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
  margin: 0 4px;
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

.task-tag {
  margin-left: 2px;
  transform: scale(.8,.8);
}

.checklist-icon {
  transform: translateY(1px);
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
