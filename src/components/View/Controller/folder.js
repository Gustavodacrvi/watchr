
import utilsTask from '@/utils/task'
import utilsList from '@/utils/list'
import utilsFolder from '@/utils/folder'
import utils from '@/utils/'
import mom from 'moment'

export default {
  methods: {
    addTask(obj) {
      if (this.viewFolder) {
        this.$store.dispatch('folder/addTaskByIndex', {
          ...obj, folderId: this.viewFolder.id,
        })
      }
    },
    rootFallbackTask(task) {
      return task
    },
    mainFallbackTask(task, force) {
      if (force || (!task.list && !task.folder && !task.heading))
        task.folder = this.viewFolder.id
      return task
    },
    
    updateIds(ids) {
      if (this.viewFolder) {
        this.$store.dispatch('folder/saveFolder', {
          tasks: ids,
          id: this.viewFolder.id,
        })
      }
    },
    saveHeaderName(name) {
      if (this.viewFolder) {
        if (this.$store.getters['folder/getFoldersByName']([name])[0])
          this.pushToast({
            name: this.l['This folder already exists!'],
            seconds: 4,
            type: 'error',
          })
        else {
          this.$router.push('/user?folder='+name)
          this.$store.dispatch('folder/saveFolder', {
            name,
            id: this.viewFolder.id,
          })
        }
      }
    },
    saveNotes(notes) {
      if (this.viewFolder) {
        this.$store.dispatch('folder/saveFolder', {
          notes, id: this.viewFolder.id,
        })
      }
    },
    addHeading(obj) {},
    onSortableAdd(evt, taskIds, type, ids) {},
    saveFolder(obj) {
      this.$store.dispatch('folder/saveFolder', {
        ...obj,
        id: this.viewFolder.id,
      })
    },
    removeDeferDate() {},
    removeRepeat() {},
    saveSchedule(info) {
      localStorage.setItem('schedule_' + this.viewName, JSON.stringify(info))
    },
    removeHeaderTag() {},
    removeDeadline() {},
    removeDeadline() {},
    removeHeaderTag() {},
    removeDeferDate() {},
  },
  computed: {
    mainFilter() {
      if (this.viewFolder)
        return task => this.isTaskInFolder(task, this.viewFolder.id)
      return () => false
    },
    rootFilter() {
      return () => true
    },
    
    icon() {return 'folder'},
    viewNameValue() {return this.viewName},
    taskCompletionCompareDate() {
      return null
    },
    files() {
      if (this.viewFolder) {
        return {
          id: this.viewFolder.id,
          storageFolder: 'folders',
          files: this.viewFolder.files,
        }
      }
      return null
    },
    tasksOrder() {
      if (this.viewFolder && this.viewFolder.tasks) {
        return this.viewFolder.tasks
      }
      return []
    },
    showEmptyHeadings() {
      return true
    },
    getListTags() {
      return []
    },
    headingsOptions() {
      return []
    },
    headerOptions() {
      if (this.viewFolder)
        return utilsFolder.getFolderOptions(this.viewFolder)
      return null
    },
    getViewNotes() {
      return null
    },
    getPieProgress() {
      return null
    },
    savedSchedule() {
      const schedule = localStorage.getItem('schedule_' + this.viewName)
      return schedule !== 'null' ? JSON.parse(schedule) : null
    },
  },
}
