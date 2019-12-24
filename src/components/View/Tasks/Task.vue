<template>
  <transition name='task-trans'
    appear
    :css="true"
    @enter='taskEnter'
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
      <transition name="edit-t" mode="out-in"
        @enter='enter'
        @leave='leave'
      >
        <div v-if="!isEditing" key="notediting"
          class="cont-wrapper task-cont-wrapper task-handle rb"
          :class="platform"
          @click="click"

          @mouseup='stopPropagation'
          @pointerup='stopPropagation'
          @pointerdown='pointerDown'
          @touchcancel.stop
          ref='cont-wrapper'
          
          @touchend.passive='touchEnd'
          @touchmove.passive='touchmove'
          @touchstart.passive='touchStart'
        >
          <div class="circle-trans-wrapper-wrapper">
            <div class="circle-trans-wrapper">
              <transition
                @enter='circleEnter'
              >
                <div v-show="showCircle" class="circle-trans-transition" :style="{left, top, backgroundImage: `radial-gradient(${innerColor}, ${outerColor})`}"></div>
              </transition>
            </div>
          </div>
          <div class="cont"
            ref='cont'
            v-longclick='longClick'
          >
            <div class="check"
              @mouseenter="iconHover = true"
              @mouseleave="iconHover = false"
              @touchstart.passive.stop
              @mousedown.passive.stop
            >
              <Icon v-if="!showCheckedIcon" :circle='true' class="icon check-icon cursor remove-highlight" @click="completeTask"
                :icon="`box${isSomeday ? '-dash' : ''}`"
                :color='circleColor'
                :stop='true'
                width="18px"
              />
              <Icon v-else :circle='true' class="icon check-icon cursor remove-highlight"
                :icon="`box-check${isSomeday ? '-dash' : ''}`"
                :color='circleColor'
                width="18px"
                :stop='true'
                @click="completeTask"
              />
            </div>
            <div class="text">
              <div class="task-name-wrapper">
                <Icon v-if="isTomorrow" class="name-icon" icon="sun" color="var(--orange)"/>
                <Icon v-else-if="isToday" class="name-icon" icon="star" color="var(--yellow)"/>
                <Icon v-else-if="isTaskOverdue" class="name-icon" icon="star" color="var(--red)"/>
                <transition name="name-t">
                  <span v-if="!showApplyOnTasks" class="task-name" key="normal" style="margin-right: 30px">
                      <span v-html="parsedName"></span>
                      <Icon v-if="haveChecklist" class="txt-icon" icon="tasks" color="var(--gray)" width="18px"/>
                      <Icon v-if="haveFiles" class="txt-icon" icon="file" color="var(--gray)" width="12px"/>
                      <span v-if="nextCalEvent" class="tag cb rb">{{ nextCalEvent }}</span>
                  </span>
                  <span v-else @click.stop="applySelected" class="apply" key="apply">{{ l['Apply selected on tasks'] }}</span>
                </transition>
              </div>
            </div>
            <span class="info">
              <span v-if="calendarStr && !isToday && !isTomorrow" class="tag cb rb">{{ calendarStr }}</span>
              <span v-if="folderStr" class="tag cb rb">{{ folderStr }}</span>
              <span v-if="listStr" class="tag cb rb">{{ listStr }}</span>
              <span v-if="task.heading && showHeadingName" class="tag cb rb">{{ task.heading }}</span>
              <span v-if="taskDuration && !schedule" class="tag cb rb">{{ taskDuration }}</span>
            </span>
          </div>
        </div>
        <div v-else-if="isEditing" key="editing">
          <Edit class="handle"
            :placeholder="l['Task name...']"
            :notesPlaceholder="l['Notes...']"
            :btnText="l['Save task']"
            :defaultTask='task'
            :showCancel='true'
            @cancel='isEditing = false'
            @save='saveTask'
          />
        </div>
      </transition>
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

import mom from 'moment/src/moment'

export default {
  props: ['task', 'viewName', 'viewNameValue', 'activeTags', 'hideFolderName', 'hideListName', 'showHeadingName', 'multiSelectOptions', 'enableSelect', 'taskHeight', 'allowCalendarStr', 'isRoot', 'taskCompletionCompareDate', 'isDragging', 'isScrolling', 'isSmart', 'scheduleObject', 'changingViewName'],
  components: {
    Timeline,
    Icon: IconVue,
    IconDrop: IconDropVue,
    Edit: EditVue,
    Tag: TagVue,
  },
  data() {
    return {
      left: 0,
      top: 0,
      innerColor: 'rgba(53, 73, 90, 0.6)',
      outerColor: 'var(--primary)',
      showCircle: false,
      isTouching: false,
      showingIconDropContent: false,
      isEditing: false,
      onHover: false,
      iconHover: false,
      doubleClickListening: false,
      doubleClickListeningTimeout: null,
      allowMobileOptions: false,
      startX: 0,
      startY: 0,
      startTime: 0,
      initialScroll: 0,
      timeout: null,

      move: false,
      customEvent: false,
    }
  },
  mounted() {
    if (this.isDesktop)
      this.bindContextMenu(this.options)

    window.addEventListener('click', this.deselectTask)
  },
  beforeDestroy() {
    window.removeEventListener('click', this.deselectTask)
  },
  methods: {
    stopPropagation(evt) {
      const time = new Date() - this.startTime
      const scrolled = Math.abs((document.scrollingElement.scrollTop - this.initialScroll)) > 20

      if (!this.isDesktop && time < 300 && !scrolled)
        evt.stopPropagation()
    },
    bindContextMenu(options) {
      utils.bindOptionsToEventListener(this.$el, options, this)
    },
    taskEnter(el, done) {
      const cont = el.getElementsByClassName('cont-wrapper')[0]
      if (cont) {
        const s = cont.style

        if (this.changingViewName && !this.isDesktop) done()
        else {
          s.transitionDuration = '0'
          s.opacity = 0
          s.height = '0px'
          
          setTimeout(() => {
            s.transitionDuration = '.25s'
            s.opacity = 1
            s.height = this.taskHeight + 'px'
          })
          setTimeout(done, 249)
        }
      }
    },
    deselectTask() {
      this.$emit('de-select', this.$el)
    },
    enter(cont) {
      if (!this.isEditing) {
        const s = cont.style
        cont.classList.add('hided')
        s.height = '0px'
        s.padding = '2px 0'
        setTimeout(() => {
          cont.classList.add('show')
          s.height = this.taskHeight + 'px'
          s.padding = '0'
          cont.classList.remove('hided')
        })
      }
    },
    leave(cont) {
      if (this.isEditing) {
        cont.style.transitionDuration = '.1s'
        cont.style.opacity = 0
      }
    },
    longClick() {
      if (!this.isDesktop && !this.isDragging && !this.isScrolling) {
        window.navigator.vibrate(100)
        this.allowMobileOptions = true
      }
    },
    openMobileOptions() {
      this.$store.commit('pushIconDrop', this.options)
    },
    completeTask() {
      const {t,c} = this.getTask
      if (!this.completed || (c && c.type === 'periodic' || c && c.type === 'weekly'))
        this.$store.dispatch('task/completeTasks', [this.task])
      else this.$store.dispatch('task/uncompleteTasks', [this.task])
    },
    singleClick() {
      if (this.isDesktop && !this.enableSelect)
        this.isEditing = true
    },
    doubleClick() {
      if (!this.isDesktop)
        this.isEditing = true
    },
    clickTrans(evt) {
      this.innerColor = 'rgba(53, 73, 90, 0.6)'
      this.outerColor = 'var(--primary)'
      this.left = (evt.offsetX + 35) + 'px'
      this.top = (evt.offsetY + 0) + 'px'
      if (!this.doingTransition)
        this.showCircle = true
    },
    pointerDown(evt) {
      if ((this.customEvent || this.move) && !this.isTaskSelected && !this.isDesktop) {
        evt.stopPropagation()
      }
      this.customEvent = false
    },
    touchStart(e) {
      this.startTime = new Date()
      this.isTouching = true
      this.innerColor = 'var(--light-gray)'
      this.outerColor = 'var(--gray)'
      this.startX = e.changedTouches[0].clientX
      this.startY = e.changedTouches[0].clientY
      const rect = e.target.getBoundingClientRect()
      this.initialScroll = document.scrollingElement.scrollTop
      if (!this.doingTransition) {
        this.left = (e.targetTouches[0].pageX - rect.left) + 'px'
        this.top = (e.targetTouches[0].pageY - rect.top - this.initialScroll) + 'px'
        this.showCircle = true
      }
      this.move = false

      this.timeout = setTimeout(() => {
        this.customEvent = true
        const evt = new CustomEvent('pointerdown')
        this.$refs['cont-wrapper'].dispatchEvent(evt)
      }, 10)
    },
    touchmove(evt) {
      this.move = Math.abs(document.scrollingElement.scrollTop - this.initialScroll) > 5
    },
    touchEnd(e) {
      const time = new Date() - this.startTime
      
      this.isTouching = false
      const touch = e.changedTouches[0]
      const movedFingerX = Math.abs(touch.clientX - this.startX) > 5
      const movedFingerY = Math.abs(touch.clientY - this.startY) > 5

      if (!this.move && (time < 201) && !movedFingerX && !movedFingerY) {
        if (this.isTaskSelected)
          this.deselectTask()
      }

      if (!movedFingerX && !movedFingerY) {
        if (this.allowMobileOptions && !this.scrolled)
          this.openMobileOptions()
      }
      this.allowMobileOptions = false
    },
    selectTask() {
      this.$emit('select', this.$el)
    },
    circleEnter(el) {
      const s = el.style
      this.doingTransition = true

      const trans = str => {
        s.transition = `opacity ${str}, width ${str}, height ${str}, transform 0s, left 0s, top 0s, margin 0s`
      }
      let innerTrans = 450
      let outerTrans = 250
      if (this.isTouching) {
        innerTrans += 150
        outerTrans += 150
      }

      trans('0s')
      s.opacity = 0
      s.width = 0
      s.height = 0
      const client = this.$el.clientWidth
      const width = client + 100
      setTimeout(() => {
        trans(`.${innerTrans}s`)
        s.opacity = 1
        s.width = width + 'px'
        s.height = width + 'px'
        setTimeout(() => {
          trans(`.${outerTrans}s`)
          s.width = width + 'px'
          s.height = width + 'px'
          s.opacity = 0
          setTimeout(() => {
            trans('0')
            s.width = 0
            s.height = 0
            this.showCircle = false
            this.doingTransition = false
          }, innerTrans)
        }, outerTrans)
      }, 50)
    },
    click(evt) {
      this.clickTrans(evt)
      if (!this.doubleClickListening) {
        this.singleClick()
        this.doubleClickListening = true
        clearTimeout(this.doubleClickListeningTimeout)
        this.doubleClickListeningTimeout = setTimeout(() => {
          this.doubleClickListening = false
        }, 200)
      } else {
        this.doubleClick()
        clearTimeout(this.doubleClickListeningTimeout)
        this.doubleClickListening = false
      }
    },
    saveTask(obj, force) {
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
    taskTags() {
      const ts = this.savedTags
      const arr = []
      for (const id of this.task.tags) {
        const tag = ts.find(el => el.id === id)
        if (tag && !this.activeTags.includes(tag.name)) arr.push(tag)
      }
      return arr
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
                callback: () => moveToList({list: list.id, heading: h.name})
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
                  callback: () => dispatch('task/convertToList', {task: this.task, savedLists: this.savedLists})
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
    isToday() {
      if (this.viewName === 'Today') return false
      return this.isTaskInView(this.task, 'Today')
    },
    isTaskOverdue() {
      if (this.viewName === 'Today') return false
      return this.isTaskInView(this.task, 'Overdue')
    },
    isTomorrow() {
      if (this.viewName === 'Tomorrow' || this.viewName === 'Today') return false
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
      if (str === this.viewNameValue) return null
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
  },
  watch: {
    selectedTasks() {
      if (this.isDesktop)
        if (this.selectedTasks && this.selectedTasks.length > 0)
          this.bindContextMenu(this.multiSelectOptions)
        else this.bindContextMenu(this.options)
    }
  }
}

</script>

<style>

.circle-trans-wrapper-wrapper {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.circle-trans-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.circle-trans-transition {
  will-change: opacity, height, width, left, top;
  position: absolute;
  transform: translate(-50%, -50%);
  opacity: .4;
  border-radius: 1000px;
}

</style>

<style scoped>

.Task {
  height: auto;
  user-select: none;
  transition: opacity .15s;
  position: relative;
  z-index: 2;
}

.Task.showingIconDropContent {
  z-index: 5;
}

.cont-wrapper {
  will-change: height, width;
  transition-duration: .25s;
  height: 38px;
}

.cont-wrapper.mobile {
  height: 50px;
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
  margin-left: 6px;
}

.desktop .cont-wrapper:hover, .desktop .cont-wrapper:active {
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

.sortable-selected .cont-wrapper {
  background-color: rgba(53, 73, 90, 0.6) !important;
  box-shadow: 1px 0 1px rgba(53, 73, 90, 0.1);
  transition: background-color .8s !important;
}

.sortable-ghost .cont-wrapper {
  background-color: var(--void) !important;
  transition-duration: 0;
  transition: none;
  height: 38px;
  padding: 0;
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

.task-trans-leave {
  height: 38px;
  opacity: 1;
}

.mobile .task-trans-leave {
  height: 50px;
}

.task-trans-leave-to, .task-trans-leave-to .cont-wrapper {
  height: 0px !important;
  opacity: 0 !important;
  overflow: hidden !important;
}

</style>
