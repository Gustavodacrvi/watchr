<template>
  <div class="Task draggable" :class="[{fade, showingIconDropContent: showingIconDropContent || isEditing}, platform]"
    @mouseenter="onHover = true"
    @mouseleave="onHover = false"
    @click="rootClick"
  >
    <transition name="edit-t" mode="out-in"
      @enter='enter'
      @leave='leave'
    >
      <div v-if="!isEditing" key="notediting"
        class="cont-wrapper task-cont-wrapper handle rb"
        :class="platform"
        @click="click"
        @dblclick="dblclick"
      >
        <div class="cont"
          v-longclick='openMobileOptions'
        >
          <div class="check cursor"
            @click.stop="completeTask"
            @mouseenter.stop="iconHover = true"
            @mouseleave="iconHover = false"
            @touchstart.stop
            @mousedown.stop
          >
            <Icon v-if="!showCheckedIcon" class="icon check-icon"
              :icon="`box${isSomeday ? '-dash' : ''}`"
              :color='circleColor'
              width="18px"
            />
            <Icon v-else class="icon check-icon"
              :icon="`box-check${isSomeday ? '-dash' : ''}`"
              :color='circleColor'
              width="18px"
            />
          </div>
          <div class="text">
            <Icon v-if="isTomorrow" class="name-icon" icon="sun" color="var(--orange)"/>
            <Icon v-else-if="isToday" class="name-icon" icon="star" color="var(--yellow)"/>
            <Icon v-else-if="isOverdue" class="name-icon" icon="star" color="var(--red)"/>
            <transition name="name-t">
              <span v-if="!showApplyOnTasks" class="task-name" key="normal" style="margin-right: 30px">
                  <span v-if="calendarStr && !isToday" class="tag cb rb">{{ calendarStr }}</span>
                  <span v-if="folderStr" class="tag cb rb">{{ folderStr }}</span>
                  <span v-if="listStr" class="tag cb rb">{{ listStr }}</span>
                  <span v-if="task.heading && showHeadingName" class="tag cb rb">{{ task.heading }}</span>
                  <span v-html="parsedName"></span>
                  <Icon v-if="haveChecklist" class="txt-icon" icon="tasks" color="var(--gray)" width="18px"/>
                  <Icon v-if="haveFiles" class="txt-icon" icon="file" color="var(--gray)" width="12px"/>
                  <span v-if="nextCalEvent" class="tag cb rb">{{ nextCalEvent }}</span>
              </span>
              <span v-else @click.stop="applySelected" class="apply" key="apply">{{ l['Apply selected on tasks'] }}</span>
            </transition>
            <template v-if="isDesktop">
              <Tag class="task-tag" v-for="t in taskTags" :key="t.name"
                icon="tag"
                :value="t.name"
                :disabled='true'
              />
            </template>
          </div>
          <div class="icon-drop-wrapper">
            <IconDrop class="icon-drop cursor"
              v-model="showingIconDropContent"
              handle='settings-v'
              :options='options'
              :hideHandle='!showIconDrop'
            />
          </div>
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
</template>

<script>

import IconVue from '../../Icon.vue'
import IconDropVue from '../../IconDrop/IconDrop.vue'
import TagVue from '../Tag.vue'
import EditVue from './Edit.vue'

import { mapState, mapGetters } from 'vuex'

import utilsTask from '@/utils/task'
import utils from '@/utils/index'

import mom from 'moment/src/moment'

export default {
  props: ['task', 'viewName', 'viewNameValue', 'activeTags', 'hideFolderName', 'hideListName', 'showHeadingName', 'multiSelectOptions', 'enableSelect', 'minimumTaskHeight'
  , 'taskCompletionCompareDate', 'isDragging', 'isScrolling', 'isSmart'],
  components: {
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
    }
  },
  mounted() {
    if (this.isDesktop)
      this.bindContextMenu(this.options)
  },
  methods: {
    bindContextMenu(options) {
      utils.bindOptionsToEventListener(this.$el, options, this)
    },
    deselectTask() {
      setTimeout(() => {
        this.$emit('de-select', this.$el)
      }, 10)
    },
    enter(cont) {
      if (!this.isEditing) {
        const s = cont.style
        const height = cont.offsetHeight + 'px'
        const lessThanMinimum = (cont.offsetHeight < this.minimumTaskHeight)
        cont.classList.add('hided')
        s.height = '0px'
        s.padding = '2px 0'
        this.deselectTask()
        setTimeout(() => {
          if (lessThanMinimum) {
          cont.classList.add('show')
            s.height = this.minimumTaskHeight + 'px'
          }
          else {
            s.height = height
          }
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
    openMobileOptions() {
      if (!this.isDesktop && !this.isDragging && !this.isScrolling) {
        window.navigator.vibrate(100)
        this.$store.commit('pushIconDrop', this.options)
      }
    },
    completeTask() {
      const {t,c} = this.getTask
      if (!this.completed || (c && c.type === 'periodic' || c && c.type === 'weekly'))
        this.$store.dispatch('task/completeTasks', [this.task])
      else this.$store.dispatch('task/uncompleteTasks', [this.task])
    },
    click() {
      if (this.isDesktop && !this.enableSelect)
        this.isEditing = true
    },
    dblclick() {
      if (!this.isDesktop)
        this.isEditing = true
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
          defer: null,
          due: null,

          type: 'specific',
          time: null,
          editDate: mom().format('Y-M-D'),

          specific: date,
          times: null,
          lastCompleteDate: null,
          periodic: null
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
    }),
    ...mapGetters({
      isDesktop: 'isDesktop',
      platform: 'platform',
      l: 'l',
      savedLists: 'list/sortedLists',
      savedFolders: 'folder/sortedFolders',
      savedTags: 'tag/sortedTagsByFrequency',
    }),
    completed() {
      return utilsTask.isTaskCompleted(this.task, mom(), this.taskCompletionCompareDate)
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
      return utilsTask.filterTasksByView([this.task], 'Today').length === 1
    },
    isTomorrow() {
      if (this.viewName === 'Tomorrow' || this.viewName === 'Today') return false
      return utilsTask.filterTasksByView([this.task], 'Tomorrow').length === 1
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
      const isOnSomedaySmartView = this.isSmart && this.viewName === 'Someday'
      return this.isSomeday && !isOnSomedaySmartView
    },
    calendarStr() {
      const {t,c} = this.getTask
      if ((!c || c.type === 'someday') || this.viewName === 'Upcoming') return null
      const str = utils.parseCalendarObjectToString(c, this.l)
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
      const {nextEventAfterCompletion} = utilsTask.taskData(t, mom())
      const date = utils.getHumanReadableDate(nextEventAfterCompletion.format('Y-M-D'), this.l)
      if (!date || date === this.viewName) return null
      return this.l["Next event"] + ' ' + date
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
  transition-duration: .15s;
}

.hided {
  opacity: 0;
  padding: 0;
  transition-duration: 0s;
}

.show {
  opacity: 1;
  padding: 2px 0;
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
  background-color: var(--light-gray) !important;
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

.check, .icon-drop-wrapper {
  justify-content: center;
  align-items: center;
}

.icon-drop-wrapper {
  position: relative;
  width: 4px;
}

.icon-drop {
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

.task-name {
  word-break: break-all;
  word-wrap: break-word;
  padding-left: 4px;
}

.icon {
  transform: translateY(2px);
}

.text {
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

.sortable-selected .cont-wrapper {
  background-color: rgba(53, 73, 90, 0.6) !important;
}

</style>
