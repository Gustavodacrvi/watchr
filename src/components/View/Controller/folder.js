
import utilsTask from '@/utils/task'
import utilsList from '@/utils/list'
import utilsFolder from '@/utils/folder'
import utils from '@/utils/'
import mom from 'moment/src/moment'

export default {
  methods: {
    addTask(obj) {
      if (this.viewFolder) {
        if (!obj.task.list)
          obj.task.folder = this.viewFolder.id
        this.$store.dispatch('folder/addTaskByIndex', {
          ...obj, folderId: this.viewFolder.id,
        })
      }
    },
    removeDeadline() {},
    removeHeaderTag() {},
    removeDeferDate() {},
    updateIds(ids) {
      if (this.viewFolder) {
        this.$store.dispatch('folder/saveFolder', {
          tasks: ids,
          id: this.viewFolder.id,
        })
      }
    },
    updateHeadingIds(ids) {},
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
    removeHeaderTag() {},
    removeDeadline() {}
  },
  computed: {
    icon() {return 'folder'},
    viewNameValue() {return this.viewName},
    getTasks() {
      if (this.viewFolder)
        return this.tasks.filter(t => t.folder === this.viewFolder.id)
      return []
    },
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
      if (this.viewFolder)
        return this.viewFolder.tasks.slice()
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
    illustration() {
      return 'folder'
    },
    headerOptions() {
      if (this.viewFolder)
        return utilsFolder.getFolderOptions(this.viewFolder, this.l, this.$store)
      return []
    },
    headingEdit() {
      return []
    },
    getViewNotes() {
      return null
    },
    getPieProgress() {
      return null
    },
  },
}
