
<template>
  <transition name="trans-t" appear
    @enter='enter'
    @leave='leave'
  >
    <div class="Edit handle rb" :class="{notPopup: !popup}" :style="editStyle">
      <div class="cont-wrapper" :class="{show}">
        <div class="tags" :class="{show: atLeastOnSpecialTag}">
          <Tag v-if="calendarStr"
            icon="calendar"
            color="var(--green)"
            :value="calendarStr"
            @click="task.calendar = null"
          />
          <Tag v-if="task.priority"
            icon="priority"
            :color="getPriorityColor"
            :value="l[task.priority]"
            @click="task.priority = ''"
          />
          <Tag v-if="task.list"
            icon="tasks"
            :value="task.list"
            color='var(--purple)'
            @click="task.list = ''"
          />
          <Tag v-if="task.list && task.heading"
            icon="heading"
            :value="task.heading"
            color='var(--purple)'
            @click="task.heading = ''"
          />
        </div>
        <div class="tags" :class="{show: task.tags.length > 0}">
          <Tag v-for="t in task.tags"
            :key="t"
            icon="tag"
            :value="t"
            @click="removeTag(t)"
          />
        </div>
        <DropInput
          :class="{'no-back': !popup}"
          v-model="task.name"
          :focus="true"
          :options="options"
          :placeholder="placeholder"
          @select="select"
          @enter='save'
          @cancel="cancel"
          @goup='$emit("goup")'
          @godown='$emit("godown")'
        />
        <DropInput
          class="notes"
          :class="{'no-back': !popup}"
          v-model="task.notes"
          :options="[]"
          :placeholder="notesPlaceholder"
          @cancel="cancel"
          @goup='$emit("goup")'
          @godown='$emit("godown")'
        />
        <Checklist
          :list='task.checklist'
          :order='task.order'
          :toggle='toggleChecklist'
          @add='addSubtask'
          @remove='removeSubtask'
          @update='updateIds'
          @convert-task='convertTask'
          @is-adding-toggle='v => isAddingChecklist = v'
        />
        <transition name="btn">
          <ButtonApp v-if="doesntHaveChecklist && !isAddingChecklist"
            style="margin-left: 4px;margin-top: 0px;margin-bottom: 8px;opacity: .6"
            type="card"
            :value="l['Add checklist']"
            @click="addChecklist"
          />
        </transition>
        <div class="files" v-if="getFiles.length > 0">
          <FileApp v-for="f in getFiles" :key="f"
            :name="f"
            :status='getFileStatus(f)'
            @delete="() => deleteFile(f)"
            @download="() => downloadFile(f)"
          />
        </div>
        <span v-if="isEditingFiles" style="opacity: .4;margin-left: 8px">{{ l["Note: file upload/delete operations won't work while offline."] }}</span>
        <div class="options">
          <div class="button-wrapper">
            <div class="button">
              <ButtonApp class="tiny" :value="buttonText" @click="save"/>
            </div>
            <span v-if="showCancel" class="cancel cursor" @click="cancel">{{ l['Cancel'] }}</span>
          </div>
          <div class="icons">
            <IconDrop
              handle="tag"
              class="opt-icon"
              :options="getTags"
            />
            <IconDrop
              handle="priority"
              class="opt-icon"
              :options="priorityOptions"
            />
            <IconDrop
              handle="tasks"
              class="opt-icon"
              :options="listOptions"
            />
            <IconDrop
              handle="calendar"
              class="opt-icon"
              :options="calendarOptions"
            />
            <Icon
              class="opt-icon cursor"
              style="margin-right: 7px;margin-top: 2px"
              width="16px"
              icon='file'
              :primaryHover="true"
              :file='true'
              @add='addFile'
            />
          </div>
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
import IconVue from '../../Icon.vue'
import ChecklistVue from './Checklist/Checklist.vue'
import FileApp from './File.vue'

import { mapGetters, mapState } from 'vuex'

import utils from '@/utils/'
import taskUtils from '@/utils/task'

import fire, { storage } from 'firebase/app'
import 'firebase/storage'

export default {
  props: ['placeholder', 'notesPlaceholder', 'defaultTask', 'showCancel', 'btnText', 'popup'],
  components: {
    DropInput: DropInputVue, FileApp,
    ButtonApp: ButtonVue,
    Checklist: ChecklistVue,
    IconDrop: IconDropVue,
    Icon: IconVue,
    Tag: TagVue,
  },
  data() {
    return {
      show: false,
      toggleChecklist: false,
      isAddingChecklist: false,
      task: {
        name: '',
        priority: '',
        list: '',
        notes: '',
        calendar: null,
        heading: null,
        tags: [],
        checklist: [],
        order: [],
        files: [],
      },
      savingTask: false,
      uploadProgress: null,
      addedFiles: [],
      optionsType: '',
      options: [],
    }
  },
  created() {
    if (this.defaultTask) {
      const t = this.defaultTask
      this.task = {...t}
      this.task.tags = t.tags.slice()
      this.task.checklist = t.checklist.slice()
      this.task.order = t.order.slice()
      this.task.files = t.files.slice()

      if (this.task.checklist)
        this.task.checklist = t.checklist.slice()
      if (t.order)
        this.task.order = t.order.slice()
      if (!this.task.checklist)
        this.task.checklist = []
      if (!this.task.order)
        this.task.order = []

      this.task.list = this.listName
      this.task.tags = this.getTagNames
    }
  },
  methods: {
    getFileStatus(fileName) {
      if (this.addedFiles.find(el => el.name === fileName))
        return 'update'
      if (this.defaultTask && this.defaultTask.files.includes(fileName) && !this.task.files.includes(fileName))
        return 'remove'
      return ''
    },
    addFile(file) {
      if (!this.task.files.includes(file.name))
        this.task.files.push(file.name)
      if (!this.addedFiles.find(el => el.name === file.name))
        this.addedFiles.push(file)
    },
    deleteFile(fileName) {
      const i = this.task.files.findIndex(el => el === fileName)
      const found = i > -1
      if (found)
        this.task.files.splice(i, 1)
      if (found && this.addedFiles.find(f => f.name === fileName)) {
        const j = this.addedFiles.findIndex(f => f.name === fileName)
        this.addedFiles.splice(j, 1)
      }
    },
    addChecklist() {
      this.toggleChecklist = !this.toggleChecklist
    },
    cancel() {
      this.leave(this.$el)
      setTimeout(() => {
        this.$emit('cancel')
      }, 301)
    },
    enter(el) {
      const s = el.style
      const height = el.offsetHeight

      s.transitionDuration = '0s'
      s.height = 0
      setTimeout(() => {
        s.transitionDuration = '.3s'
        if (height < 36)
          s.height = '35px'
        else
          s.height = height + 'px'
        setTimeout(() => {
          this.show = true
        }, 290)
        setTimeout(() => {
          el.style.height = 'auto'
        }, 300)
      }, 50)
    },
    leave(el) {
      const s = el.style

      s.transitionDuration = '0s'
      s.height = el.offsetHeight + 'px'
      setTimeout(() => {
        this.show = false
        s.transitionDuration = '.3s'
        s.overflow = 'hidden'
        s.backgroundColor = 'var(--back-color)'
        s.boxShadow = '0 0 0 #000'
        s.height = 0
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
    },
    updateIds(ids) {
      this.task.order = ids
    },
    convertTask({ids, index, id}) {
      ids.splice(index, 0, id)
      this.task.order = ids
      this.task.checklist.push({
        completed: false, id,
        name: this.savedTasks.find(el => el.id === id).name
      })

      this.$store.dispatch('task/deleteTasks', [id])
    },
    addSubtask({name, index, ids}) {
      const id = utils.getUid()

      ids.splice(index, 0, id)
      this.task.order = ids
      this.task.checklist.push({
        name, completed: false, id,
      })
      this.name = ''
    },
    downloadFile(fileName) {
      storage().ref(`attachments/${this.user.uid}/tasks/${this.task.id}/${fileName}`).getDownloadURL().then(url => {
        const xhr = new XMLHttpRequest()
        xhr.responseType = 'blob'
        xhr.onload = event => {
          const blob = xhr.response
          url = window.URL.createObjectURL(blob)
          let element = document.createElement('a')
          element.setAttribute('href', url)
          element.setAttribute('download', fileName)
        
          element.style.display = 'none'
          document.body.appendChild(element)
        
          element.click()
        
          document.body.removeChild(element)
        }
        xhr.open('GET', url)
        xhr.send()
      })
    },
    save() {
      const t = this.task
      if (t.name) {
        let n = t.name
        const i = n.indexOf(' $')
        if (i && i > -1 && t.calendar) {
          n = n.substr(0, i)
        }
        let heading = t.heading
        let calendar = t.calendar
        if (heading === undefined) heading = null
        if (calendar === undefined) calendar = null
        if (this.isEditingFiles && this.addedFiles.length > 0)
          this.savingTask = true
        this.$emit('save', {
          ...t,
          list: this.listId,
          tags: this.tagIds,
          name: n, heading,
          calendar,
          files: this.task.files,
          handleFiles: this.isEditingFiles ? taskId => {
            return this.saveFiles(this.getFilesToRemove, this.addedFiles, taskId)
          } : null
        })
        t.checklist = []
        t.notes = ''
        t.name = ''
        t.order = []
      }
    },
    saveFiles(toRemoveFiles, toAddFiles, taskId) {
      const rem = toRemoveFiles.slice()
      const add = toAddFiles.slice()
      for (const r of rem) {
        if (add.find(el => el.name === r)) {
          const i = rem.findIndex(f => f === r)
          rem.splice(i, 1)
        }
      }

      let totalBytes = 0
      this.uploadProgress = 0
      add.forEach(file => totalBytes += file.size)
      const store = fire.storage()

      const fileProgress = {}

      const calcProgress = () => {
        let totalTransferred = 0
        const values = Object.values(fileProgress)
        values.forEach(v => totalTransferred += v)
        this.uploadProgress = (totalTransferred / totalBytes) * 100
      }

      const taskPath = `attachments/${this.user.uid}/tasks/${taskId}/`
      const addFiles = () => {
        const proms = []
        for (const f of add) {
          proms.push(new Promise((solve, reject) => {
            const ref = store.ref(taskPath + f.name)
            const upload = ref.put(f)
            upload.on('state_changed', snap => {
              fileProgress[f.name] = snap.bytesTransferred
              calcProgress()
            })
            upload.then(solve)
          }))
        }
        return Promise.all(proms)
      }
      const removeFiles = () => {
        const proms = []
        for (const r of rem) {
          proms.push(new Promise((solve, reject) => {
            const ref = store.ref(taskPath + r) 
            ref.delete().then(solve)
          }))
        }
        return Promise.all(proms)
      }
      return new Promise((solve, reject) => {
        Promise.all([
          addFiles(),
          removeFiles(),
        ]).then(() => {
          solve()
          this.task.addedFiles = []
          this.task.files = []
          this.savingTask = false
          this.uploadProgress = null
          if (this.defaultTask)
            this.$emit('cancel')
        }).catch(reject)
      })
    },
    getFileEditProgress() {

    },
    removeTag(name) {
      const index = this.task.tags.findIndex(el => el === name)
      this.task.tags.splice(index, 1)
    },
    addTag(name) {
      if (!this.task.tags.some(e => e === name))
        this.task.tags.push(name)
    },
  },
  computed: {
    ...mapState({
      savedTags: state => state.tag.tags,
      savedTasks: state => state.task.tasks,
      savedLists: state => state.list.lists,
      user: state => state.user,
    }),
    ...mapGetters(['l']),
    isEditingFiles() {
      return this.getFilesToRemove.length > 0 ||
        this.addedFiles.length > 0
    },
    getFiles() {
      let files
      if (this.defaultTask)
        files = [...this.defaultTask.files.filter(el => {
          return !this.task.files.includes(el)
        }), ...this.task.files]
      else files = this.task.files.slice()
      files.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
      return files
    },
    getFilesToRemove() {
      // check if removed file is being updated with a new file on the addedFiles
      if (this.defaultTask)
        return this.defaultTask.files.filter(f =>
          !this.task.files.includes(f) &&
          !this.addedFiles.find(added => added.name === f))
      return []
    },
    isEditing() {
      return this.defaultTask
    },
    doesntHaveChecklist() {
      return this.task.checklist.length === 0
    },
    calendarOptions() {
      return {
        comp: 'CalendarPicker',
        content: {callback: this.selectDate, repeat: true}
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
      const tags = this.savedTags
      const names = []
      for (const id of this.task.tags) {
        const tag = tags.find(el => el.id === id)
        if (tag) names.push(tag.name)
      }
      return names
    },
    listName() {
      if (this.task.list)
        return this.$store.getters['list/getListsById']([this.task.list])[0].name
      return ''
    },
    listId() {
      if (this.task.list)
        return this.$store.getters['list/getListsByName']([this.task.list]).map(el => el.id)[0]
      return null
    },
    selectDate() {
      return (date) => this.task.calendar = date
    },
    buttonText() {
      if (this.btnText) return this.btnText
      return this.l['Add task']
    },
    atLeastOnSpecialTag() {
      const t = this.task
      return this.calendarStr || t.priority || t.list || (t.list && t.heading)
    },
    calendarStr() {
      if (this.task.calendar)
        return utils.parseCalendarObjectToString(this.task.calendar, this.l)
      return null
    },
    getTaskName() {
      return this.task.name
    },
    getTags() {
      const arr = []
      for (const el of this.savedTags) {
        arr.push({
          name: el.name,
          icon: 'tag',
          callback: () => {
            this.addTag(el.name)
          },
        })
      }
      return {
        links: arr,
        allowSearch: true,
      }
    },
    tagIds() {
      return this.$store.getters['tag/getTagsByName'](this.task.tags).map(el => el.id)
    },
    priorities() {
      return this.$store.getters['task/priorityOptions']
    },
    listOptions() {
      const arr = []
      for (const el of this.savedLists) {
        arr.push({
          name: el.name,
          icon: 'tasks',
          callback: () => {
            this.task.list = el.name
            const arr = []
            for (const h of el.headings) {
              arr.push({
                name: h.name,
                icon: 'heading',
                callback: () => this.task.heading = h.name
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
        const pri = (priority) => {
          const obj = {
            'Low priority': ' !l',
            'Medium priority': ' !m',
            'High priority': ' !h',
          }
          this.task.priority = priority
          this.task.name = n.replace(obj[priority], '')
        }
        if (n.includes(' !l')) pri('Low priority')
        else if (n.includes(' !m')) pri('Medium priority')
        else if (n.includes(' !h')) pri('High priority')
        else if (n.includes(' !no')) {
          this.task.priority = null
          this.task.name = n.replace(' !no', '')
        }
      }
      const parseTags = () => {
        const tags = this.savedTags
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
        const lists = this.savedLists
        for (const li of lists) {
          const listName = ` @${li.name}`
          if (n.includes(listName)) {
            this.task.name = n.replace(listName, '')
            this.task.list = li.name
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
      const parseDate = () => {
        if (n.includes(' $')) {
          const obj = utils.parseInputToCalendarObject(n, this.l)
          this.task.calendar = obj
        } else if (this.task) {
          this.task.calendar = this.task.calendar
        }
      }

      parsePriority()
      parseTags()
      parseLists()
      parseDate()

      if (!changedOptions) this.options = []
    },
  }
}

</script>

<style scoped>

.trans-t-enter, .trans-t-leave-to {
  opacity: 0;
  background-color: var(--back-color);
  box-shadow: 0 0 0 #000;
}

.trans-t-leave, .trans-t-enter-to {
  opacity: 1;
  background-color: var(--card);
  box-shadow: 0 2px 6px rgba(0,0,0,.3);
}

.Edit {
  background-color: var(--card);
  box-shadow: 0 2px 6px rgba(0,0,0,.3);
}

.cont-wrapper {
  opacity: 0;
  transition-duration: .2s;
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
  transition-duration: .2s;
  display: flex;
  flex-wrap: wrap;
}

.show {
  opacity: 1;
}

.options {
  padding-left: 4px;
  padding-bottom: 4px;
}

.show .tags.show {
  margin: 6px;
  margin-bottom: 0;
  height: auto;
}

.tags {
  padding-bottom: 4px;
  display: flex;
}

.cancel {
  color: var(--red);
  margin-left: 6px;
}

.cancel:hover {
  text-decoration: underline;
}

.files {
  margin: 24px 10px;
}

.options {
  margin-top: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.button-wrapper {
  flex-basis: 100%;
}

.button {
  display: inline-block;
}

.icons {
  display: inline-flex;
  flex-basis: 100%;
  flex-direction: row-reverse;
  align-items: center;
}

.opt-icon {
  margin-right: 6px;
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
  height: 0;
  transition-duration: .2s;
}

.btn-leave, .btn-enter-to {
  opacity: 1;
  height: 35px;
  transition-duration: .2s;
}

</style>
