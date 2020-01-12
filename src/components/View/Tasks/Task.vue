<template>
  <transition name='task-trans'
    appear
    :css="true"
    @enter='taskEnter'
    @beforeLeave='taskLeave'
  >
    <div class="Task draggable" :class="[{fade, showingIconDropContent: showingIconDropContent || isEditing, schedule: schedule && !isEditing}, platform]"
      @mouseenter="onHover = true"
      @mouseleave="onHover = false"
      @click="rootClick"
    >
      <transition name="fade-t">
        <Timeline v-if="schedule && !isEditing"
          v-bind="schedule"
        />
      </transition>
      <div v-if="doneTransition && !isEditing && !isDesktop"
        class="back rb"
        :style="{height: (taskHeight - 5) + 'px'}"
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
        class="cont-wrapper task-handle rb"
        :class='{doneTransition, isTaskMainSelection}'
        ref="cont-wrapper"
        :style="{right: right + 'px'}"

        @mouseup='stopMouseUp'
        @pointerdown='pointerdown'
        @pointerup.stop
        @touchcancel.stop
        
        @touchend.passive='touchEnd'
        @touchmove.passive='touchmove'
        @touchstart.passive='touchStart'
      >
        <transition name='task-edit'
          @enter='enter'
          @leave='leave'
        >
          <div v-if="!isEditing" key="notediting"
            class="cont-wrapper-wrapper rb task-cont-wrapper"
            :class="platform"
            @click="click"
            :style='{height: taskHeight + "px"}'
          >
            <CircleBubble
              innerColor='var(--light-gray)'
              outerColor='var(--gray)'
              opacity='0'
            />
            <div class="cont"
              ref='cont'
            >
              <div class="check" ref='check'
                @mouseenter="iconHover = true"
                @mouseleave="iconHover = false"
                @touchend.passive='touchComplete'
                :class="{changeColor}"
              >
                <Icon :circle='true' class="icon check-icon cursor remove-highlight"
                  :icon="getTaskIcon"
                  :color='circleColor'
                  :stop='true'
                  width="20px"
                  @click="desktopComplete"
                />
              </div>
              <div class="text"
                :class="{changeColor}"
              >
                <div class="task-name-wrapper">
                  <transition name="name-t">
                    <span v-if="!showApplyOnTasks" class="task-name" key="normal" style="margin-right: 30px">
                      <span v-html="parsedName"></span>
                      <Icon v-if="haveChecklist"
                        class="txt-icon checklist-icon"
                        icon="pie"
                        color="var(--gray)"
                        width="12px"
                        :progress='checklistPieProgress'
                      />
                      <Icon v-if="hasTags" class="txt-icon" icon="tag" color="var(--gray)" width="14px"/>
                      <Icon v-if="haveFiles" class="txt-icon" icon="file" color="var(--gray)" width="12px"/>
                      <span v-if="nextCalEvent" class="tag cb rb">{{ nextCalEvent }}</span>
                    </span>
                    <span v-else @click.stop="applySelected" class="apply" key="apply">{{ l['Apply selected on tasks'] }}</span>
                  </transition>
                </div>
              </div>
              <span class="info" ref='info'>
                <Icon v-if="isTomorrow" class="name-icon" icon="sun" color="var(--orange)"/>
                <Icon v-else-if="isToday" class="name-icon" icon="star" color="var(--yellow)"/>
                <Icon v-else-if="isTaskOverdue" class="name-icon" icon="star" color="var(--red)"/>
                <span v-if="calendarStr && !isToday && !isTomorrow" class="tag cb rb">{{ calendarStr }}</span>
                <span v-if="folderStr" class="tag cb rb">{{ folderStr }}</span>
                <span v-if="listStr" class="tag cb rb">{{ listStr }}</span>
                <span v-if="task.heading && showHeadingName" class="tag cb rb">{{ task.heading }}</span>
                <span v-if="taskDuration && !schedule" class="tag cb rb">{{ taskDuration }}</span>
              </span>
            </div>
          </div>
          <div v-else-if="isEditing" key="editing">
            <Edit class="handle" @pointerdown.native.stop
              :placeholder="l['Task name...']"
              :notesPlaceholder="l['Notes...']"
              :btnText="l['Save task']"
              :defaultTask='task'
              :taskHeight='taskHeight'
              :showCancel='true'
              @cancel='isEditing = false'
              @save='saveTask'
            />
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>

<script>

import IconVue from '../../Icon.vue'
import IconDropVue from '../../IconDrop/IconDrop.vue'
import TagVue from '../Tag.vue'
import EditVue from './Edit.vue'
import Timeline from './Timeline.vue'

import { mapState, mapGetters } from 'vuex'

import utilsTask from '@/utils/task'
import utilsMoment from '@/utils/moment'
import utils from '@/utils/index'

import mom from 'moment'

export default {
  props: ['task', 'viewName', 'viewNameValue', 'activeTags', 'hideFolderName', 'hideListName', 'showHeadingName', 'multiSelectOptions',  'taskHeight', 'allowCalendarStr', 'isRoot', 'taskCompletionCompareDate', 'isDragging', 'isScrolling', 'isSmart', 'scheduleObject', 'changingViewName', 'mainSelection',
  'isSelecting'],
  components: {
    Timeline,
    Icon: IconVue,
    IconDrop: IconDropVue,
    Edit: EditVue,
    Tag: TagVue,
  },
  data() {
    return {
      showingIconDropContent: false,
      isEditing: false,
      onHover: false,
      iconHover: false,
      startX: 0,
      startY: 0,
      startTime: 0,
      initialScroll: 0,
      moved: false,
      right: 0,
      timeout: null,
      changeColor: false,
      justCompleted: false,
      justSaved: false,
      doneTransition: false,
    }
  },
  mounted() {
    if (this.isDesktop)
      this.bindContextMenu(this.options)

    window.addEventListener('click', this.deselectTask)

    this.bindMainSelection()
  },
  beforeDestroy() {
    window.removeEventListener('click', this.deselectTask)
    if (this.isTaskMainSelection)
      window.removeEventListener('keydown', this.mainSelectionKeyDown)
  },
  methods: {
    bindMainSelection() {
      if (this.isDesktop)
        if (this.isTaskMainSelection)
          window.addEventListener('keydown', this.mainSelectionKeyDown)
        else
          window.removeEventListener('keydown', this.mainSelectionKeyDown)
    },
    mainSelectionKeyDown(evt) {
      const p = () => evt.preventDefault()
      const {key} = evt
      switch (key) {
        case 'Enter': {
          if (!this.justSaved)
            this.isEditing = true
          break
        }
        case ' ': {
          p()
          this.$emit('add-task-after-selection')
          break
        }
      }
    },
    enter(el) {
      if (!this.isEditing) {
        const co = el.style
        const inf = this.$refs['info'].style
        let ni
        if (this.$refs['name-icon'])
          ni = this.$refs['name-icon'].style
        const c = this.$refs['check'].style
        this.doneTransition = false

        c.transitionDuration = 0
        co.transitionDuration = 0
        inf.transitionDuration = 0
        c.opacity = 0
        inf.opacity = 0
        if (ni) ni.opacity = 0
        co.transform = 'translateX(-27px)'
        this.deselectTask()
        setTimeout(() => {
          c.transitionDuration = '.25s'
          co.transitionDuration = '.25s'
          inf.transitionDuration = '.25s'
          c.opacity = .6
          inf.opacity = 1
          if (ni) ni.opacity = .6
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
        let ni
        if (this.$refs['name-icon'])
          ni = this.$refs['name-icon'].style
        const c = this.$refs['check'].style
        this.doneTransition = false

        c.transitionDuration = 0
        co.transitionDuration = 0
        inf.transitionDuration = 0
        c.opacity = .6
        inf.opacity = 1
        if (ni) ni.opacity = .6
        co.transform = 'translateX(0px)'
        setTimeout(() => {
          c.transitionDuration = '.25s'
          co.transitionDuration = '.25s'
          inf.transitionDuration = '.25s'
          c.opacity = 0
          inf.opacity = 0
          if (ni) ni.opacity = 0
          co.transform = 'translateX(-27px)'
          setTimeout(() => {
            this.doneTransition = true
          }, 252)
        })
      } else {
        el.style.transitionDuration = '.25s'
      }
    },
    bindContextMenu(options) {
      utils.bindOptionsToEventListener(this.$el, options, this)
    },
    taskLeave() {
      this.doneTransition = false
    },
    taskEnter(el, done) {
      const cont = this.$refs['cont-wrapper']
      this.doneTransition = false
      if (cont) {
        const s = cont.style

        s.transitionDuration = '0'
        setTimeout(() => this.doneTransition = true, 300)
        if (this.changingViewName && !this.isDesktop) {
          done()
        } else {
          s.opacity = 0
          s.height = '0px'
          s.minHeight = '0px'
          
          setTimeout(() => {
            s.transitionDuration = '.25s'
            s.opacity = 1
            s.height = this.taskHeight + 'px'
            done()
          })
          setTimeout(() => {
            s.transitionDuration = '0s'
            s.height = 'auto'
            s.minHeight = this.taskHeight + 'px'
          }, 300)
        }
      }
    },
    deselectTask() {
      setTimeout(() => {
        this.$emit('de-select', this.$el)
      }, 10)
    },
    openMobileOptions() {
      window.navigator.vibrate(100)
      this.$store.commit('pushIconDrop', this.options)
    },
    desktopComplete() {
      if (this.isDesktop)
        this.completeTask()
    },
    completeTask() {
      const {t,c} = this.getTask
      if (!this.completed || (c && c.type === 'periodic' || c && c.type === 'weekly'))
        this.$store.dispatch('task/completeTasks', [this.task])
      else this.$store.dispatch('task/uncompleteTasks', [this.task])
    },
    stopMouseUp(evt) {
      if (!this.isDesktop)
        evt.stopPropagation()
    },
    touchStart(e) {
      this.startTime = new Date()
      const touch = e.changedTouches[0]

      this.startX = touch.clientX
      this.startY = touch.clientY

      this.initialScroll = document.scrollingElement.scrollTop

      this.changeColor = true
      this.timeout = setTimeout(() => {
        this.openMobileOptions()
      }, 350)
    },
    touchmove(evt) {
      this.moved = true
      const touch = evt.changedTouches[0]
      const move = Math.abs(document.scrollingElement.scrollTop - this.initialScroll) > 5 || Math.abs(touch.clientX - this.startX) > 5 || Math.abs(touch.clientY - this.startY) > 5
      if (move) {
        clearTimeout(this.timeout)
        this.fail = true
      }

      const diff = this.startX - touch.clientX
      if (diff > 0) {
        if (diff < 75)
          this.right = diff
        else this.right = 75
      } else {
        this.right = 0
      }
    },
    pointerdown(evt) {
      if (!this.isDesktop)
        evt.stopPropagation()
    },
    touchEnd(e) {
      const select = this.right > 60
      if (this.moved) {
        const cont = this.$refs['cont-wrapper'].style

        cont.transitionDuration = '.2s'
        this.right = 0
        setTimeout(() => {
          cont.transitionDuration = 0
        }, 280)
      }
      
      clearTimeout(this.timeout)
      const time = new Date() - this.startTime

      const fail = this.fail || time > 250

      const toggleTask = () => {
        if (!this.isTaskSelected && !this.justCompleted)
          this.selectTask()
        else this.deselectTask()
      }

      if (select) {
        this.selectTask()
      } else {
        if (!this.isSelecting) {
          if (!this.moved && !this.justCompleted) this.isEditing = true
        } else {
          if (!fail) toggleTask()
        }
      }

      this.fail = false
      this.moved = false
      this.changeColor = false
      this.justCompleted = false
    },
    touchComplete() {
      this.justCompleted = true
      this.completeTask()
    },
    selectTask() {
      this.$emit('select', this.$el)
    },
    click() {
      if (this.isDesktop && !this.isSelecting)
        this.isEditing = true
    },
    saveTask(obj, force) {
      this.justSaved = true
      setTimeout(() => {
        this.justSaved = false
      }, 100)
      this.$store.dispatch('task/saveTask', {
        id: this.task.id,
        ...obj,
      })
      if (!obj.handleFiles || force)
        this.isEditing = false
    },
    addPriority(pri) {
      this.$store.dispatch('task/saveTask', {
        id: this.task.id,
        priority: pri,
      })
    },
    applySelected() {
      setTimeout(() => {
        this.$store.commit('applyAppnavSelected', this.task.id)
      })
    },
    saveCalendarDate(calendar) {
      this.$store.dispatch('task/saveTasksById', {
        ids: [this.task.id],
        task: {calendar},
      })
    },
    saveDate(date) {
      this.$store.dispatch('task/saveTask', {
        id: this.task.id,
        calendar: {
          type: 'specific',
          time: null,
          editDate: mom().format('Y-M-D'),
          begins: mom().format('Y-M-D'),

          specific: date,
        },
      })
    },
    rootClick(event) {
      if (this.isSelectingAppnavEls) event.stopPropagation()
    },
    escapeHTML(string) {
      let div = document.createElement("div")
      div.innerHTML = string
      return div.textContent || div.innerText || ""
    },
    getLinkString(str) {
      const matches = str.match(this.urlRegex)
      if (matches) {
        const split = str.split(' ')
        let newStr = ''
        for (let i = 0; i < split.length;i++) {
          const txt = split[i + 1]
          const link = split[i]
          if (link && matches.includes(link) && txt && !matches.includes(txt)) {
            newStr += ` <a class='task-link' href="${link}">${txt}</a>`
            i++
          } else newStr += ' ' + link
        }
        str = newStr
      }
      return str
    },
  },
  computed: {
    ...mapState({
      isOnControl: state => state.isOnControl,
      selectedEls: state => state.selectedEls,
      selectedTasks: state => state.selectedTasks,
      userInfo: state => state.userInfo,
    }),
    ...mapGetters({
      isDesktop: 'isDesktop',
      platform: 'platform',
      l: 'l',
      isTaskCompleted: 'task/isTaskCompleted',
      isTaskInView: 'task/isTaskInView',
      savedLists: 'list/sortedLists',
      savedFolders: 'folder/sortedFolders',
      savedTags: 'tag/sortedTagsByName',
    }),
    checklistPieProgress() {
      let completed = this.task.checklist.reduce((acc, opt) => opt.completed ? acc + 1 : acc, 0)
      return 100 * completed / this.task.checklist.length
    },
    completed() {
      return this.isTaskCompleted(this.task, mom().format('Y-M-D'), this.taskCompletionCompareDate)
    },
    isTaskSelected() {
      return this.selectedTasks.includes(this.task.id)
    },
    parsedName() {
      return this.getLinkString(this.escapeHTML(this.task.name))
    },
    isSomeday() {
      const {c} = this.getTask
      return c && c.type === 'someday'
    },
    urlRegex() {
      return /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g
    },
    haveChecklist() {
      return this.task.checklist && this.task.checklist.length > 0
    },
    haveFiles() {
      return this.task.files && this.task.files.length > 0
    },
    hasTags() {
      return this.task.tags && this.task.tags.length > 0
    },
    folderOptions() {
      const links = []
      for (const fold of this.savedFolders) {
        links.push({
          name: fold.name,
          icon: 'folder',
          callback: () => {
            this.$store.dispatch('task/saveTask', {
              id: this.task.id,
              folder: fold.id,
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
          id: this.task.id,
          folder: null,
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
              name: this.l['List root'],
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
    options() {
      const {c,t} = this.getTask
      const dispatch = this.$store.dispatch
      const l = this.l
      const arr = [
        {
          name: l['Pomo this task'],
          icon: 'pomo',
          callback: () => {
            this.$store.dispatch('pomo/toggle', {task: this.task, stopToggle: true})
          },
        },
        {
          name: l['No date'],
          icon: 'bloqued',
          callback: () => this.saveCalendarDate(null)
        },
        {
          type: 'optionsList',
          name: l['Schedule'],
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
          ]
        },
        {
          type: 'optionsList',
          name: l['Priority'],
          options: [
            {
              icon: 'priority',
              id: 'd',
              color: 'var(--gray)',
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
          name: l['More options'],
          icon: 'settings-h',
          callback: () => [
            {
              name: l['Repeat task'],
              icon: 'repeat',
              callback: () => [
                {
                  name: l['Repeat weekly'],
                  icon: 'repeat',
                  callback: () => ({
                    comp: 'WeeklyPicker',
                    content: {callback: this.saveCalendarDate},
                  }),
                },
                {
                  name: l['Repeat periodically'],
                  icon: 'repeat',
                  callback: () => ({
                    comp: 'PeriodicPicker',
                    content: {callback: this.saveCalendarDate},
                  }),
                },
              ],
            },
            {
              name: l['Copy task'],
              icon: 'copy',
              callback: () => dispatch('task/copyTask', this.task)
            },
            {
              name: l['Lists'],
              icon: 'tasks',
              callback: () => [
                {
                  name: l['Move to list'],
                  icon: 'tasks',
                  callback: () => this.listOptions
                },
                {
                  name: l['Convert to list'],
                  icon: 'tasks',
                  callback: () => {
                    const existingList = this.savedLists.find(l => l.name === this.task.name)
                    if (existingList)
                      this.$store.commit('pushToast', {
                        name: 'There is already another list with this name.',
                        seconds: 3,
                        type: 'error',
                      })
                    else
                      dispatch('task/convertToList', {task: this.task, savedLists: this.savedLists})
                  }
                },
              ]
            },
            {
              name: l['Move to folder'],
              icon: 'folder',
              callback: () => this.folderOptions
            },
            {
              name: l['Delete task'],
              icon: 'trash',
              important: true,
              callback: () => dispatch('task/deleteTasks', [this.task.id])
            }
          ]
        },
      ]
      if (c && c.persistent && (c.type === "periodic" || c.type === "periodic"))
        arr.splice(3, 0, {
          name: l["Manual complete"],
          icon: 'circle-check',
          callback: () => dispatch('task/manualCompleteTasks', [t])
        })
      return arr
    },
    showApplyOnTasks() {
      return !this.isOnControl && this.isSelectingAppnavEls && this.onHover
    },
    isSelectingAppnavEls() {
      return this.selectedEls.length > 0
    },
    isOverdue() {
      if (this.viewName === 'Overdue') return false
      return false
    },
    isTaskMainSelection() {
      return this.task.id === this.mainSelection
    },
    isToday() {
      if (this.viewName === 'Today' || this.viewName === 'Calendar') return false
      return this.isTaskInView(this.task, 'Today')
    },
    isTaskOverdue() {
      if (this.viewName === 'Today') return false
      return this.isTaskInView(this.task, 'Overdue')
    },
    isTomorrow() {
      if (this.viewName === 'Tomorrow' || this.viewName === 'Today' || this.viewName === 'Calendar') return false
      return this.isTaskInView(this.task, 'Tomorrow')
    },
    showIconDrop() {
      return this.isDesktop && this.onHover
    },
    listStr() {
      const list = this.task.list
      if (!list || this.hideListName) return null
      const savedList = this.savedLists.find(el => el.id === list)
      if (!savedList || (savedList.name === this.viewName)) return null
      return savedList.name
    },
    folderStr() {
      const folder = this.task.folder
      if (!folder || this.hideFolderName) return null
      const fold = this.savedFolders.find(f => f.id === folder)
      if (!fold || (fold.name === this.viewName)) return null
      return fold.name
    },
    fade() {
      if (this.completed) return true
    },
    calendarStr() {
      const {t,c} = this.getTask
      if ((!c || c.type === 'someday') || (!this.allowCalendarStr && !this.isRoot)) return null
      const str = utils.parseCalendarObjectToString(c, this.l, this.userInfo)
      if (str === this.viewNameValue || (str === 'Today' && this.viewName === 'Calendar')) return null
      return str
    },
    showCheckedIcon() {
      if (!this.isDesktop) return this.completed
      if (this.completed)
        return !this.iconHover
      return this.iconHover
    },
    nextCalEvent() {
      const {t,c} = this.getTask
      if ((!c || c.type === 'someday') || (c.type !== 'periodic' && c.type !== 'weekly')) return null
      const nextEventAfterCompletion = utilsMoment.getNextEventAfterCompletionDate(c)

      const date = utils.getHumanReadableDate(nextEventAfterCompletion.format('Y-M-D'), this.l)
      if (!date || date === this.viewName) return null
      return this.l["Next event"] + ' ' + date
    },
    taskDuration() {
      return this.task.taskDuration ? utils.formatQuantity(this.task.taskDuration) : null
    },
    getTask() {
      return {
        t: this.task,
        c: this.task.calendar
      }
    },
    circleColor() {
      if (!this.task.priority) return ''
      const obj = {
        'Low priority': 'var(--green)',
        'Medium priority': 'var(--yellow)',
        'High priority': 'var(--red)',
      }
      return obj[this.task.priority]
    },
    schedule() {
      if (this.scheduleObject)
        return this.scheduleObject[this.task.id]
      return null
    },
    getTaskIcon() {
      const t = this.task

      let icon = this.isSelecting ? 'circle' : 'box'
      icon += this.completed ? '-check' : ''
      icon += this.isSomeday ? '-dash' : ''

      return icon
    },
  },
  watch: {
    selectedTasks() {
      if (this.isDesktop)
        if (this.selectedTasks && this.selectedTasks.length > 0)
          this.bindContextMenu(this.multiSelectOptions)
        else this.bindContextMenu(this.options)
    },
    isTaskMainSelection() {
      this.bindMainSelection()
    },
  }
}

</script>

<style scoped>

.Task {
  height: auto;
  user-select: none;
  transition: opacity .15s;
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
  transition: background-color .2s !important;
}

.cont-wrapper-wrapper {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  overflow: hidden;
}


.cont-wrapper.mobile {
  min-height: 50px;
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

.isTaskMainSelection {
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

.info {
  flex-basis: 20px;
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

.calendarStr {
  position: absolute;
  top: 50%;
  transform: translateY(-45%);
  right: -.5px;
}

.check {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 35px;
  height: 100%;
  opacity: .6;
}

.handle, .Task, .cont {
  outline: none;
}

.cont {
  position: relative;
}

.task-name-wrapper {
  max-width: 100%;
  position: absolute;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transform: translateY(-1px);
}

.task-name {
  padding-left: 4px;
}

.icon {
  transform: translateY(2px);
}

.text {
  position: relative;
  align-items: center;
  flex-basis: 100%;
  margin-left: 35px;
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

.sortable-selected .cont-wrapper {
  background-color: rgba(53, 73, 90, 0.6) !important;
  box-shadow: 1px 0 1px rgba(53, 73, 90, 0.1);
  transition: background-color .8s !important;
}

.sortable-selected .back {
  opacity: 0;
  transition-delay: 0s;
}

.sortable-ghost .cont-wrapper {
  background-color: var(--void) !important;
  transition-duration: 0;
  transition: none;
  height: 38px;
  padding: 0;
}

.mobile.sortable-ghost .cont-wrapper {
  height: 50px;
}

.name-t-enter {
  opacity: 0;
  transform: translateY(-25px); 
}

.name-t-enter-active, .name-t-leave-active {
  position: absolute;
  transition-duration: .15s;
}

.name-t-enter-to, .name-t-leave {
  transform: translateY(0px);
  opacity: 1;
}

.name-t-leave-to {
  opacity: 0;
  transform: translateY(25px);
}

.check-icon {
  opacity: .6;
}

.task-trans-leave-active {
  transition-duration: .25s !important;
  transition: height .25s, opacity .25s !important;
}

.task-trans-leave-active .back {
  opacity: 0;
  transition-delay: 0s;
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
  transition-delay: .3s;
}

.task-trans-leave, .task-trans-leave .cont-wrapper {
  height: 38px;
  opacity: 1;
}

.mobile .task-trans-leave, .task-trans-leave .cont-wrapper {
  height: 50px;
}

.task-trans-leave-to, .task-trans-leave-to .cont-wrapper {
  height: 0px !important;
  opacity: 0 !important;
  overflow: hidden !important;
}

</style>
