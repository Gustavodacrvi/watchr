
<template>
  <transition name="trans-t" appear
    @enter='enter'
    @leave='leave'
  >
    <div class="Edit handle rb TaskEditComp" :class="[{notPopup: !popup}, layout]" :style="editStyle"

      @mouseup.stop
    >
      <div class="fix-back" @click="remove"></div>
      <div class="edit-wrapper">
        <DropInput ref="task-name" class="name-input"
          :class="{'no-back': !popup, hide: !defaultTask, show}"
          v-model="task.name"
          :focus="true"
          :options="options"
          :placeholder="placeholder"
          :onPaste='onPaste'
          :focusToggle='focusToggle'
          @select="select"
          @enter='save'
          @cancel="cancel"
          @goup='$emit("goup")'
          @godown='$emit("godown")'
        />
        <DropInput ref='task-notes'
          class="notes hide"
          :msg='dropInput'
          :class="{'no-back': !popup, show}"
          v-model="task.notes"
          :onPaste='onNotePast'
          :enterOnShift='true'
          :options="[]"
          :placeholder="notesPlaceholder"

          @enter='save'
          @cancel="cancel"
          @goup='$emit("goup")'
          @godown='$emit("godown")'
        />
        <div class="tags-wrapper" :class="{showTag: atLeastOnSpecialTag || task.tags && task.tags.length > 0}">
          <div class="tags" :class="{show}">
            <Tag v-if="task.taskDuration"
              icon="duration"
              color="var(--purple)"
              :value="taskDurationStr"
              @click="task.taskDuration = ''"
            />
            <Tag v-if="deadlineStr"
              icon="deadline"
              color="var(--red)"
              :value="deadlineStr"
              @click="task.deadline = ''"
            />
            <Tag v-if="calendarStr"
              :icon="getCalendarStrIcon"
              :color="getCalendarStrColor"
              :value="calendarStr"
              @click="removeCalendar"
            />
            <Tag v-if="isEvening"
              icon="moon"
              color="var(--dark-purple)"
              value="Evening"
              @click="toggleEvening"
            />
            <Tag v-if="task.priority"
              icon="priority"
              :color="getPriorityColor"
              :value="task.priority"
              @click="task.priority = ''"
            />
            <Tag v-if="task.folder"
              icon="folder"
              :value="task.folder"
              color=''
              @click="task.folder = ''"
            />
            <Tag v-if="task.group"
              icon="group"
              :value="task.group"
              color=''
              @click="task.group = ''"
            />
            <Tag v-if="task.list"
              icon="tasks"
              :value="task.list"
              color='var(--primary)'
              @click="task.list = ''"
            />
            <Tag v-if="task.list && task.heading"
              icon="heading"
              :value="task.heading"
              color='var(--primary)'
              @click="removeHeading"
            />
          </div>
          <div class="tags" :class="{show}">
            <template v-if="task.tags">
              <Tag v-for="t in task.tags"
                :key="t"
                icon="tag"
                color='var(--red)'
                :value="t"
                @click="removeTag(t)"
              />
            </template>
          </div>
        </div>
        <div class="file-drag-drop-wrapper">
          <FileDragDrop
            :onDrop='onDrop'
          />
        </div>
        <Checklist v-if="!isFirstEdit"
          ref='checklist'
          :list='getChecklist'

          :activeChecklistId='activeChecklistId'
          :compareDate='getCompareDate'

          @move-cursor='moveCursor'

          @reset-cursor='resetCursor'
          @add='addSubtask'
          @remove='removeSubtask'
          @update='updateIds'
          @save-checklist='saveChecklist'
          @is-adding-toggle='v => isAddingChecklist = v'
        />
        <div class="files show" :class="{show, hasFiles: files.length > 0}">
          <FileApp v-for="f in getFiles" :key="f"
            :name="f"
            :status='getFileStatus(f)'
            @delete="deleteFile(f)"
            @download="downloadFile(f, 'tasks', task.id)"
            @view="viewFile(f, 'tasks', task.id)"
          />
        </div>
        <span v-if="isEditingFiles" class="files show" :class="{show}" style="opacity: .4;margin-left: 8px">Note: file upload/delete operations won't work while offline.</span>
        <div class="options hide" :class="{show}">
          <transition name='btn'>
            <div v-if="showingOptions" class='icons row'>
              <Icon
                class="icon-box primary-hover cursor"
                width="16px"
                icon='menu'
                :active='isIcon(2)'
                :box='true'
                ref='checklist-icon'
                @click='addChecklist'
                title='Add checklist'
              />
              <Icon v-if='showEveningIcon'
                class="icon-box primary-hover cursor"
                width="15px"
                icon='moon'
                :active='isIcon(3)'
                :box='true'
                ref='evening'
                @click='toggleEvening'
                title='Add to evening'
              />
            </div>
          </transition>
          <transition name="btn">
            <div v-if="showingOptions" class="icons">
              <IconDrop
                handle="tag"
                :box='true'
                width="18px"
                :options="getTags"
                :active='isIcon(12)'
                ref='tag'
               
                handleColor='var(--red)'
                title='Add tags'
                :center='true'
              />
              <IconDrop
                handle="priority"
                :box='true'
                width="18px"
                :options="priorityOptions"
                :active='isIcon(11)'
                ref='priority'
               
                handleColor='var(--yellow)'
                title='Add priority'
                :center='true'
              />
              <IconDrop
                handle="calendar"
                width="18px"
                :box='true'
                :options="calendarOptions"
                :active='isIcon(7)'
                ref='calendar'
               
                handleColor='var(--green)'
                title='Add date'
                :center='true'
              />
              <Icon
                class="icon-box primary-hover cursor"
                width="18px"
                icon='file'
                :active='isIcon(6)'
                :box='true'
                ref='file'
                :file='true'
                @add='onDrop'
                title='Add files'
              />
              <IconDrop
                handle="deadline"
                width="18px"
                :box='true'
                :active='isIcon(5)'
                ref='deadline'
                :options="deadlineOptions"
               
                handleColor='var(--orange)'
                title='Add deadline'
                :center='true'
              />
              <IconDrop
                handle="duration"
                width="18px"
                :box='true'
                :active='isIcon(4)'
                ref='duration'
                :options="durationOptions"
               
                handleColor='var(--purple)'
                title='Add task duration'
                :center='true'
              />
            </div>
          </transition>
        </div>
      </div>
      <transition name="progress-t">
        <div v-if="savingTask" class="progress">
          <div class="progress-line" :style="{width: `${uploadProgress}%`}"></div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>

import TagVue from '../Tag.vue'
import DropInputVue from '../../Auth/DropInput.vue'
import ButtonVue from '../../Auth/Button.vue'
import IconDropVue from '../../IconDrop/IconDrop.vue'
import ChecklistVue from './Checklist/Checklist.vue'
import FileApp from './../RenderComponents/File.vue'
import FileDragDrop from './../RenderComponents/FileDragDrop.vue'

import { mapGetters, mapState } from 'vuex'

import utils from '@/utils/'
import taskUtils from '@/utils/task'
import momUtils from '@/utils/moment'

import FileMixin from '@/mixins/file.js'

export default {
  mixins: [FileMixin],
  props: ['placeholder', 'notesPlaceholder', 'defaultTask', 'showCancel', 'btnText', 'popup', 'quickAdd', 'focusToggle', 'taskHeight', 'editAction', 'fallbackItem'],
  components: {
    FileDragDrop,
    DropInput: DropInputVue, FileApp,
    ButtonApp: ButtonVue,
    Checklist: ChecklistVue,
    IconDrop: IconDropVue,
    Tag: TagVue,
  },
  data() {
    return {
      show: false,
      isAddingChecklist: false,
      task: {
        name: '',
        priority: '',
        taskDuration: '',
        deadline: '',
        folder: '',
        group: '',
        list: '',
        notes: '',
        calendar: null,
        heading: null,
        headingId: null,
        tags: [],
        checklist: [],
        order: [],
      },
      fromIconDrop: false,
      toReplace: null,
      readyToRemove: false,
      savingTask: false,
      optionsType: '',
      options: [],
      fromDefaultTask: false,
      isFirstEdit: true,

      cursorPos: 0,

      lastKeys: [],
      keydownSettimeout: null,
    }
  },
  created() {
    setTimeout(() => {
      this.readyToRemove = true
    }, 80)
    if (this.defaultTask) {
      const t = this.defaultTask
      this.task = {...this.task, ...t}
      if (t.tags)
        this.task.tags = t.tags.slice()
      else this.task.tags = []
      if (t.checklist)
        this.task.checklist = t.checklist.slice()
      else this.task.checklist = []
      if (t.order)
        this.task.order = t.order.slice()
      else this.task.order = []
      if (t.heading) {
        this.task.headingId = t.heading
        this.task.heading = this.listHeadingName
      }

      if (this.task.checklist)
        this.task.checklist = t.checklist.slice()
      if (t.order)
        this.task.order = t.order.slice()
      if (!this.task.checklist)
        this.task.checklist = []
      if (!this.task.order)
        this.task.order = []

      this.task.list = this.listName
      this.task.folder = this.folderName
      this.task.group = this.groupName
      this.task.tags = this.getTagNames

      if (this.task.calendar)
        this.fromDefaultTask = true
    }
    setTimeout(() => this.isFirstEdit = false, 200)

    window.addEventListener('click', this.remove)
    window.addEventListener('keydown', this.keydown)
  },
  beforeDestroy() {
    this.$store.commit('isEditing', false)
    window.removeEventListener('click', this.remove)
    window.removeEventListener('keydown', this.keydown)
  },
  mounted() {
    this.$store.commit('isEditing', true)
    if (this.editAction) {
      this[this.editAction]()
      this.$emit('done-action')
    }
  },
  methods: {
    removeCalendar() {
      this.task.calendar = null
      this.fromDefaultTask = false
      this.fromIconDrop = false
      this.toReplace = null
    },
    focusName() {
      this.$refs['task-name'].focusInput(0)
    },
    moveCursor(dire) {
      const newIndex = this.cursorPos + dire
      if (this.keyboardActions[newIndex])
        this.cursorPos = newIndex
    },
    focusNotes() {
      this.$refs['task-notes'].focusInput(0)
    },
    incrementPos(inc) {
      const newIndex = this.cursorPos + inc
      if (this.keyboardActions[newIndex])
        this.cursorPos = newIndex
      else if (inc > 0)
        this.cursorPos = 0
      else this.cursorPos = this.lastKeyboardActionIndex
    },
    keydown(evt) {
      const p = () => evt.preventDefault()
      const {key} = evt

      const active = document.activeElement
      const isTyping = active && (active.nodeName === 'INPUT' || active.nodeName === 'TEXTAREA')

      if (this.isCursorInChecklist && !isTyping) {
        switch (key) {
          case "Delete": {
            this.removeSubtask(this.activeChecklistId)
            break
          }
          case '.': {
            this.$refs.checklist.toggleTask(this.activeChecklistId)
            p()
            break
          }
          case " ": {
            this.$refs.checklist.addEdit(this.cursorPos - 1)
            p()
            break
          }
          case "Enter": {
            if (!isTyping) {
              p()
              this.$refs.checklist.editChecklist(this.activeChecklistId)
            }
            break
          }
        }
      }

      if (key === "Escape" && !isTyping)
        this.cancel()
      if (key === "Enter" && this.isElementFunction && !isTyping)
        this.keyboardActions[this.cursorPos]()

      utils.saveByShortcut(this, true, key, p, (type, task) => {
        switch (type) {
          case 'CalendarPicker': {
            this.fromIconDrop = task !== null
            if (task !== null)
              this.toReplace = null
            
            this.task.calendar = task
            this.fromDefaultTask = false
            break
          }
          case 'save': {
            if (task.tags && task.tags.length > 0) {
              this.task = {
                ...this.task,
                tags: this.getTagsById(task.tags).map(el => el.name)
              }
            } else if (task.list) {
              this.task = {
                ...this.task,
                list: this.getListsById([task.list]).map(el => el.name)[0],
                heading: null,
                group: null,
                folder: null,
              }
            } else if (task.folder) {
              this.task = {
                ...this.task,
                folder: this.getFoldersById([task.folder]).map(el => el.name)[0],
                list: null,
                group: null,
                heading: null,
              }
            } else {
              this.task = {...this.task, ...task}
            }
          }
        }
      }, ['CalendarPicker'])

      const isNotEditingOrIsNotOnNotes = (!this.isEditingNotes || this.cursorPos !== 1)

      const allowNav = isNotEditingOrIsNotOnNotes || this.isOnShift

      if (!this.iconDrop && this.options.length === 0 && allowNav) {
        if (key === "ArrowUp") {
          p()
  
          if (this.isOnShift && isNotEditingOrIsNotOnNotes)
            this.cursorPos = 0
          else        
            this.incrementPos(-1)
        } else if (key === "ArrowDown") {
          p()
  
          if (this.isOnShift && isNotEditingOrIsNotOnNotes)
            this.cursorPos = this.lastKeyboardActionIndex
          else        
            this.incrementPos(1)
        }
      }
    },
    onNotePast(txt) {
      const splitStrs = [' • ',' * ',' - ', ' [ ] ']

      let toSplit = null

      for (const split of splitStrs) {
        if (txt.split(split).length > 2) {
          toSplit = split
          break
        }
      }

      if (toSplit) {
        txt.split(toSplit).filter(s => s)
          .forEach(task => this.addSubtask({
            name: task,
            index: this.task.checklist.length,
            ids: this.task.order
          }))
      }
      
    },
    onPaste(txt) {
      if (this.fallbackItem) {
        let str = ''
        const lines = txt.split('\n').map(el => el.trim()).filter(el => el.length > 0)
  
        const tasks = []
        for (const l of lines) {
          const { str, priority } = taskUtils.parsePriorityFromString(l)
          tasks.push(this.fallbackItem({
            name: str,
            priority,
            taskDuration: '',
            folder: '',
            list: '',
            notes: '',
            calendar: null,
            heading: null,
            headingId: null,
            tags: [],
            checklist: [],
            order: [],
            files: [],
          }))
        }
        if (lines.length > 1 && lines[0].length > 0)
          this.$store.commit('pushIconDrop', {
            comp: "Confirm",
            content: {
              msg: `Do you want to add ${tasks.length} tasks?`,
              callback: () => this.$store.dispatch('task/addMultipleTasks', tasks),
            },
          })
      }
    },
    saveChecklist() {
      if (this.defaultTask && this.task.checklist)
        this.$store.dispatch('task/saveTask', {
          id: this.task.id,
          checklist: this.task.checklist || [],
          order: this.task.order || [],
        })
    },
    resetCursor() {
      if (!this.isAddingChecklist)
        this.cursorPos = 0
    },
    remove(evt) {
      if (this.readyToRemove) {
        let found = false
        const path = event.path || (event.composedPath && event.composedPath())
        for (const node of path)
          if (node.classList && node.classList.contains('edit-wrapper')) {
            found = true
            break
          }
        if (!found && !this.iconDrop && !this.popup) {
          this.cancel()
        }
      }
    },
    addChecklist() {
      this.$refs.checklist.addChecklist()
    },
    cancel() {
      this.leave(this.$el)
      if (this.defaultTask)
        this.$emit('cancel')
      else
        setTimeout(() => {
          this.$emit('cancel')
        }, 301)
    },
    enter(el) {
      const s = el.style
      const height = el.offsetHeight

      if (this.defaultTask) {
        const t = this.$refs['task-name'].$el.style

        t.transitionDuration = 0
        const y = this.isDesktopBreakPoint ? -2 : 4
        t.transform = `translate(27px, ${y}px)`
        requestAnimationFrame(() => {
          t.transitionDuration = '.15s'
          t.transform = `translate(0px, ${y}px)`
        })
      }

      s.transitionDuration = '0s'
      s.height = this.taskHeight ? this.taskHeight + 'px' : 0
      s.margin = 0
      requestAnimationFrame(() => {
        s.transitionDuration = '.15s'
        if (height < 36)
          s.height = '35px'
        else
          s.height = height + 'px'
        if (!this.quickAdd)
          s.margin = '50px 0'
        setTimeout(() => {
          this.show = true
        }, 290)
        setTimeout(() => {
          el.style.height = 'auto'
        }, 300)
      })
    },
    leave(el) {
      const s = el.style

      if (this.defaultTask) {
        const t = this.$refs['task-name'].$el.style

        t.transitionDuration = 0
        t.opacity = 0
        const y = this.isDesktopBreakPoint ? -2 : 4
        t.transform = `translate(0px, ${y}px)`
        requestAnimationFrame(() => {
          t.transitionDuration = '.15s'
          t.transform = `translate(27px, ${y}px)`
        })
      }

      s.transitionDuration = '0s'
      s.height = el.offsetHeight + 'px'
      requestAnimationFrame(() => {
        this.show = false
        s.transitionDuration = '.15s'
        s.overflow = 'hidden'
        s.backgroundColor = 'var(--back-color)'
        s.boxShadow = '0 0 0 #000'
        s.margin = 0
        s.height = this.taskHeight ? this.taskHeight + 'px' : 0
      })
    },
    select(value) {
      const arr = this.task.name.split(' ')
      arr[arr.length - 1] = this.optionsType + value
      let str = ''
      for (const s of arr)
        str += s + ' '
      str = str.slice(0, -1)
      this.task.name = str
    },
    removeSubtask(id) {
      const i = this.task.checklist.findIndex(el => el.id === id)
      this.task.checklist.splice(i, 1)
      this.saveChecklist()
    },
    updateIds(ids) {
      this.task.order = ids
      this.saveChecklist()
    },
    addSubtask({name, index, ids}) {
      const id = utils.getUid()

      ids.splice(index, 0, id)
      this.task.order = ids
      this.task.checklist.push({
        name, completed: false, id,
      })
      this.saveChecklist()
    },
    save() {
      if (!this.iconDrop) {
        const t = this.task
        if (this.defaultTask && !this.isEditingFiles)
          this.leave(this.$el)
        if (t.name) {
          if (t.folder) {
            this.task.list = ''
            this.task.heading = ''
            this.task.headingId = ''
            this.task.group = ''
          }
          if (t.group) {
            this.task.heading = ''
            this.task.headingId = ''
            this.task.folder = ''
            this.task.tags = []
          }
          if (t.list) {
            this.task.folder = ''
          }
          
          let n = t.name
          if (this.toReplace)
            for (const s of this.toReplace)
              if (!this.fromIconDrop && s)
                n = n.replace(new RegExp(s), '')
          let heading = t.headingId
          let calendar = t.calendar
          if (heading === undefined) heading = null
          if (calendar === undefined) calendar = null
          if (this.isEditingFiles && this.addedFiles.length > 0)
            this.savingTask = true

          this.$emit('save', {
            ...t,
            list: this.listId,
            folder: this.folderId,
            group: this.groupId,
            tags: this.tagIds,
            name: n.trim(), heading,
            calendar,
            files: this.files,
            handleFiles: this.isEditingFiles ? taskId => {
              return new Promise((solve, reject) => {
                this.saveFiles(this.getFilesToRemove, this.addedFiles, taskId, 'tasks')
                .then(() => {
                  this.files = []
                  this.addedFiles = []
                  this.leave(this.$el)
                  solve()
                })
                .catch(() => {
                  this.$store.commit('pushToast', {
                    name: 'An error occurred while editing files.',
                    seconds: 4,
                    type: 'error',
                  })
                  reject()
                })
              })
            } : null
          })
          t.checklist = []
          t.notes = ''
          t.name = ''
          t.order = []
        }
      }
    },
    removeTag(name) {
      if (this.task.tags) {
        const index = this.task.tags.findIndex(el => el === name)
        this.task.tags.splice(index, 1)
      }
    },
    addTag(name) {
      if (!this.task.tags)
        this.task.tags = []
      if (!this.task.tags.some(e => e === name))
        this.task.tags.push(name)
    },
    selectDuration(time) {
      if (time !== '00:00')
        this.task.taskDuration = time
    },
    removeHeading() {
      this.task.heading = ''
      this.task.headingId = ''
    },
    isIcon(num) {
      let pos = this.cursorPos

      if (!this.showEveningIcon && pos >= (3 + this.task.checklist.length))
        pos++
      
      return !this.hasChecklist ? num === pos : (num + this.task.checklist.length) === pos
    },
    toggleEvening() {
      const c = this.task.calendar
      this.task.calendar = {...c, evening: !c.evening} 
    },
  },
  computed: {
    ...mapState({
      iconDrop: state => state.iconDrop,
      user: state => state.user,
      userInfo: state => state.userInfo,

      isOnControl: state => state.isOnControl,
      isOnShift: state => state.isOnShift,
      isOnAlt: state => state.isOnAlt,
    }),
    ...mapGetters({
      savedTasks: 'task/tasks',
      isRecurringTask: 'task/isRecurringTask',
      isDesktopBreakPoint: 'isDesktopBreakPoint',
      layout: 'layout',
      getTagsById: 'tag/getTagsById',
      getListsById: 'list/getListsById',
      getFoldersById: 'folder/getFoldersById',
      lists: 'list/sortedLists',
      folders: 'folder/sortedFolders',
      groups: 'group/sortedGroupsByName',
      tags: 'tag/sortedTagsByName',
    }),
    dropInput() {
      if (!this.isDesktopBreakPoint)
        return ''
      return this.isEditingNotes ? "Shift + Arrows keys to move, Shift + Enter to save" : "Shift + Enter to save"
    },
    isEditingNotes() {
      return this.task.notes.length > 0
    },
    getCompareDate() {
      if (!this.item) return null
      const c = this.item.calendar
      if (!c || !this.isRecurringTask(this.item))
        return null
      return momUtils.getNextEventAfterCompletionDate(c).format('Y-M-D')
    },
    activeChecklistId() {
      return this.keyboardActions[this.cursorPos]
    },
    isCursorInChecklist() {
      return this.task.checklist.some(el => el.id === this.activeChecklistId)
    },
    hasChecklist() {
      return this.task.checklist.length > 0
    },
    showEveningIcon() {
      const c = this.task.calendar
      return c && c.type !== 'someday' && c.type !== 'anytime' && !c.evening
    },
    keyboardActions() {
      const c = ref => () => this.$refs[ref].click()

      const obj = {
        0: this.focusName,
        1: this.focusNotes,
      }

      const hasChecklist = this.hasChecklist

      let num = 2
      
      for (const t of this.getChecklist) {
        obj[num] = t.id
        num++ 
      }
      
      const getIconsObj = () => {
        let num = !hasChecklist ? 2 : this.task.checklist.length + 2

        const icons = [
          'checklist-icon',
          'duration',
          'deadline',
          'file',
          'calendar',
          'group',
          'folder',
          'tasks',
          'priority',
          'tag',
        ]

        if (this.showEveningIcon)
          icons.splice(1, 0, 'evening')

        return icons.reduce((obj, icon) => {
          obj[num] = c(icon)
          num++
          return obj
        }, {})
      }
      
      return {
        ...obj,
        ...getIconsObj(),
      }
    },
    lastKeyboardActionIndex() {
      return Object.keys(this.keyboardActions).length - 1
    },
    showingOptions() {
      return !this.isAddingChecklist
    },
    isEditing() {
      return this.defaultTask
    },
    doesntHaveChecklist() {
      return !this.getChecklist || this.getChecklist.length === 0
    },
    calendarOptions() {
      return {
        comp: 'CalendarPicker',
        content: {callback: date => {
          this.fromIconDrop = date !== null
          if (date !== null)
            this.toReplace = null
          
          this.task.calendar = date
          this.fromDefaultTask = false
        }, repeat: true}
      }
    },
    deadlineOptions() {
      return {
        comp: 'CalendarPicker',
        content: {
          onlyDates: true,
          noTime: true,
          allowNull: true,
          callback: date => {
            this.task.deadline = date.specific
          }
        }
      }
    },
    durationOptions() {
      return {
        comp: 'TimePicker',
        content: {
          callback: this.selectDuration,
          msg: 'Task duration:',
          format: '24hr',
        }
      }
    },
    editStyle() {
      if (this.popup)
        return {
          boxShadow: 'none !important',
        }
      return {}
    },
    getTagNames() {
      const tags = this.tags
      const names = []
      if (this.task.tags)
        for (const id of this.task.tags) {
          const tag = tags.find(el => el.id === id)
          if (tag) names.push(tag.name)
        }
      return names
    },
    getListObj() {
      if (this.task.list)
        return this.$store.getters['list/getListsById']([this.task.list])[0]
    },
    listName() {
      if (this.task.list)
        return this.getListObj.name
      return ''
    },
    isGroupList() {
      if (this.task.list)
        return this.getListObj.group
      return false
    },
    listHeadingName() {
      if (this.task.list && this.task.heading) {
        const list = this.$store.getters['list/getListsById']([this.task.list])[0]
        if (list.headings && list.headings.length > 0) {
          return list.headings.find(head => head.id === this.task.heading).name
        }
      }
      return ''
    },
    folderName() {
      if (this.task.folder)
        return this.$store.getters['folder/getFoldersById']([this.task.folder])[0].name
      return ''
    },
    getChecklist() {
      return this.$store.getters.checkMissingIdsAndSortArr(this.task.order, this.task.checklist)
    },
    folderId() {
      if (this.task.folder)
        return this.$store.getters['folder/getFoldersByName']([this.task.folder]).map(el => el.id)[0]
      return null
    },
    groupName() {
      if (this.task.group)
        return this.$store.getters['group/getGroupsById']([this.task.group])[0].name
      return ''
    },
    groupId() {
      if (this.task.group)
        return this.$store.getters['group/getGroupsByName']([this.task.group]).map(el => el.id)[0]
      return null
    },
    listId() {
      if (this.task.list)
        return this.$store.getters['list/getListsByName']([this.task.list]).map(el => el.id)[0]
      return null
    },
    buttonText() {
      if (this.btnText) return this.btnText
      return 'Add task'
    },
    atLeastOnSpecialTag() {
      const t = this.task
      return this.calendarStr || t.deadline || t.priority || t.folder || t.group || t.taskDuration || t.list || (t.list && t.heading)
    },
    isEvening() {
      return this.task.calendar && this.task.calendar.evening
    },
    calendarStr() {
      if (this.task.calendar)
        return utils.parseCalendarObjectToString(this.task.calendar, this.userInfo, true)
      return "Inbox"
    },
    getCalendarStrColor() {
      if (!this.task.calendar)
        return 'var(--primary)'
      if (this.isRecurringTask(this.task))
        return 'white'
      switch (this.calendarStr) {
        case 'Someday': return 'var(--brown)'
        case 'Anytime': return 'var(--olive)'
        case 'Today': return 'var(--yellow)'
      }
      if (this.calendarStr.includes('Tomorrow'))
        return 'var(--orange)'
      return 'var(--green)'
    },
    getCalendarStrIcon() {
      if (!this.task.calendar)
        return 'inbox'
      if (this.isRecurringTask(this.task))
        return 'repeat'
      switch (this.calendarStr) {
        case 'Someday': return 'archive'
        case 'Anytime': return 'layer-group'
        case 'Today': return 'star'
      }
      if (this.calendarStr.includes('Tomorrow'))
        return 'sun'
      return 'calendar'
    },
    deadlineStr() {
      if (this.task.deadline)
        return utils.getHumanReadableDate(this.task.deadline)
    },
    taskDurationStr() {
      if (this.task.taskDuration)
        return 'Takes ' + utils.formatQuantity(this.task.taskDuration)
      return null
    },
    getTaskName() {
      return this.task.name
    },
    getTags() {
      return utils.tagsOptions(this, this.task.tags, names => this.task.tags = names.slice())
    },
    tagIds() {
      return this.$store.getters['tag/getTagsByName'](this.task.tags || []).map(el => el.id)
    },
    priorities() {
      return this.$store.getters['task/priorityOptions']
    },
    isElementFunction() {
      const el = this.keyboardActions[this.cursorPos]
      return el && {}.toString.call(el) === '[object Function]'
    },
    groupOptions() {
      return {
        links: this.groups.map(el => ({
          icon: 'group',
          name: el.name,
          callback: () => {
            this.task.group = el.name
            this.task.list = ''
            this.task.folder = ''
            this.task.heading = ''
            this.task.headingId = ''
          }
        })),
        allowSearch: true,
      }
    },
    folderOptions() {
      const arr = []
      for (const el of this.folders) {
        arr.push({
          name: el.name,
          icon: 'folder',
          callback: () => {
            this.task.folder = el.name
            this.task.list = ''
            this.task.group = ''
            this.task.heading = ''
            this.task.headingId = ''
          }
        })
      }
      return {
        links: arr,
        allowSearch: true,
      }
    },
    listOptions() {
      const arr = []
      for (const el of this.lists) {
        arr.push({
          name: el.name,
          icon: 'tasks',
          callback: () => {
            this.task.list = el.name
            this.task.folder = ''
            this.task.group = el.group || ''
            this.task.group = this.groupName
            const arr = []
            for (const h of el.headings) {
              arr.push({
                name: h.name,
                icon: 'heading',
                callback: () => {
                  this.task.headingId = h.id
                  this.task.heading = h.name
                }
              })
            }
            return arr
          }
        })
      }
      return {
        links: arr,
        allowSearch: true,
      }
    },
    priorityOptions() {
      const links = this.priorities
      for (const l of links) {
        l.callback = ({name}) => {
          if (name !== 'No priority')
            this.task.priority = name
          else this.task.priority = ''
        }
      }
      return links
    },
    getPriorityColor() {
      const obj = {
        "High priority": "var(--red)",
        "Medium priority": "var(--orange)",
        "Low priority": "var(--primary)",
      }
      return obj[this.task.priority]
    },
  },
  watch: {
    'task.name'() {
      const n = this.task.name
      let changedOptions = false
      const parsePriority = () => {
        const { priority, str } = taskUtils.parsePriorityFromString(n)
        if (priority !== null) {
          this.task.name = str
          this.task.priority = priority
        }
      }
      const parseTags = () => {
        const tags = this.tags
        for (const tag of tags) {
          const tagName = ` #${tag.name}`
          if (n.includes(tagName)) {
            this.task.name = n.replace(tagName, '')
            this.addTag(tag.name)
            break
          }
        }
        const arr = n.split(' ')
        const lastWord = arr[arr.length - 1]
        if (lastWord[0] === '#') {
          this.optionsType = '#'
          const word = lastWord.substr(1)

          this.options = tags.map(el => el.name).filter(el => el.toLowerCase().includes(word.toLowerCase()))
          changedOptions = true
        }
      }
      const parseLists = () => {
        const lists = this.lists
        for (const li of lists) {
          const listName = ` @${li.name}`
          if (n.includes(listName)) {
            this.task.name = n.replace(listName, '')
            this.task.list = li.name
            this.task.group = li.group || ''
            this.task.group = this.groupName
            this.task.folder = ''
            break
          }
        }
        const arr = n.split(' ')
        const lastWord = arr[arr.length - 1]
        if (lastWord[0] === '@') {
          this.optionsType = '@'
          const word = lastWord.substr(1)

          this.options = lists.map(el => el.name).filter(el => el.toLowerCase().includes(word.toLowerCase()))
          changedOptions = true
        }
      }
      const parseFolder = () => {
        const folders = this.folders
        for (const f of folders) {
          const folderName = ` $${f.name}`
          if (n.includes(folderName)) {
            this.task.name = n.replace(folderName, '')
            this.task.folder = f.name
            this.task.list = ''
            this.task.group = ''
            this.task.heading = ''
            this.task.headingId = ''
            break
          }
        }
        const arr = n.split(' ')
        const lastWord = arr[arr.length - 1]
        if (lastWord[0] === '$') {
          this.optionsType = '$'
          const word = lastWord.substr(1)

          this.options = this.folders.map(el => el.name).filter(el => el.toLowerCase().includes(word.toLowerCase()))
          changedOptions = true
        }
      }
      const parseGroup = () => {
        const groups = this.groups
        for (const f of groups) {
          const folderName = ` %${f.name}`
          if (n.includes(folderName)) {
            this.task.name = n.replace(folderName, '')
            this.task.folder = ''
            this.task.list = ''
            this.task.group = f.name
            this.task.heading = ''
            this.task.headingId = ''
            break
          }
        }
        const arr = n.split(' ')
        const lastWord = arr[arr.length - 1]
        if (lastWord[0] === '%') {
          this.optionsType = '%'
          const word = lastWord.substr(1)

          this.options = this.groups.map(el => el.name).filter(el => el.toLowerCase().includes(word.toLowerCase()))
          changedOptions = true
        }
      }

      if (!this.isFirstEdit) {
        const res = utils.calendarObjNaturalCalendarInput(n, this.userInfo.disablePmFormat)
        this.toReplace = res.matches
        if (res && res.calendar) {
          this.task.calendar = res.calendar
          this.fromDefaultTask = false
          this.fromIconDrop = null
        } else if (!this.fromIconDrop && !this.fromDefaultTask) {
          this.fromDefaultTask = false
          this.task.calendar = null
        }
      }

      parsePriority()
      parseTags()
      parseLists()
      parseFolder()
      parseGroup()

      if (!changedOptions) this.options = []
    },
    cursorPos(newPos, oldPos) {
      if (this.isAddingChecklist)
        this.$refs.checklist.removeEdit()
      if (newPos === 2 && oldPos === 1)
        this.$refs['task-notes'].removeFocus()
      else if (newPos === this.lastKeyboardActionIndex && oldPos === 0)
        this.$refs['task-name'].removeFocus()

      if (this.cursorPos < 2 && this.isElementFunction)
        this.keyboardActions[this.cursorPos]()
    },
  }
}

</script>

<style scoped>

.fix-back {
  position: fixed;
  height: 100%;
  width: 100%;
  z-index: 200;
  left: 0;
  top: 0;
}

.edit-wrapper {
  position: relative;
  z-index: 201;
}

.trans-t-enter-active {
  transition-timing-function: ease-out;
}

.trans-t-leave-active {
  transition-timing-function: ease-in;
}

.trans-t-enter, .trans-t-leave-to {
  opacity: 0;
  background-color: var(--back-color);
  box-shadow: 0 0 0 rgba(15,15,15,0);
}

.trans-t-leave, .trans-t-enter-to {
  opacity: 1;
  background-color: var(--card);
  box-shadow: 0 4px 12px rgba(15,15,15,.2);
}

.Edit {
  background-color: var(--card);
  box-shadow: 0 4px 12px rgba(15,15,15,.2);
}

.edit-wrapper {
  transition-duration: .15s;
}

.hide {
  opacity: 0;
}

.selected {
  background-color: var(--light-gray);
}

.notPopup .notes {
  margin-top: -12px;
}

.tags {
  margin: 0;
  height: 0;
  float: left;
  z-index: 5;
  position: relative;
  transition-duration: .15s;
  display: flex;
  flex-wrap: wrap;
}

.show {
  opacity: 1;
  transition-duration: .15s;
}

.tags-wrapper {
  position: relative;
  width: 100%;
  height: 0;
  min-height: 0;
  transition-duration: .15s;
}

.file-drag-drop-wrapper {
  margin: 0 12px;
}

.showTag {
  margin: 10px 0;
  padding: 0 10px;
  min-height: 22px;
  height: auto;
}

.tags {
  padding-bottom: 4px;
  display: flex;
  margin-right: 0 !important;
}

.tags + .tags {
  margin-left: 0 !important;
}

.cancel {
  color: var(--red);
  margin-left: 6px;
}

.cancel:hover {
  text-decoration: underline;
}

.files {
  margin: 0;
  transition-duration: .15s;
}

.hasFiles {
  margin: 24px 10px;
}

.options {
  display: flex;
  padding: 4px 12px;
  align-items: center;
}

.button-wrapper {
  flex-basis: 100%;
}

.button {
  display: inline-block;
}

.name-input {
  z-index: 10;
}

.icons {
  display: flex;
  flex-basis: 100%;
  flex-direction: row-reverse;
  align-items: center;
  min-height: 35px;
  position: relative;
}

.row {
  margin-left: 0px;
  flex-direction: row;
}

.progress {
  bottom: 0;
  width: 100%;
  height: 3px;
  margin-top: 4px;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  overflow: hidden;
  background-color: var(--dark);
  transition: height .1s, margin-top .1s;
}

.progress-line {
  background-color: var(--primary);
  height: 100%;
}

.progress-t-enter, .progress-t-leave-to {
  height: 0;
  margin-top: 0;
}

.progress-t-leave, .progress-t-enter-to {
  height: 3px;
  margin-top: 3px;
}

.btn-enter, .btn-leave-to {
  opacity: 0;
  max-height: 0;
  min-height: 0;
  height: 0;
  overflow: visible !important;
  transition-duration: .15s;
}

.btn-leave, .btn-enter-to {
  opacity: 1;
  min-height: 35px;
  height: 35px;
  max-height: 35px;
  overflow: visible !important;
  transition-duration: .15s;
}

</style>
