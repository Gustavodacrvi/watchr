
import utilsTask from '@/utils/task'
import utilsList from '@/utils/list'
import utils from '@/utils/'
import mom from 'moment'

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
/*       if (this.viewList) {
        this.$store.dispatch('list/saveList', {
          notes, id: this.viewList.id,
        })
      } */
    },
    addHeading(obj) {
/*       if (this.viewList) {
        this.$store.dispatch('list/addHeading', {...obj, listId: this.viewList.id})
      } */
    },
    onSortableAdd(evt, taskIds, type, ids) {
/*       if (this.viewList) {
        this.$store.dispatch('list/removeTasksFromHeading', {
          taskIds, ids, listId: this.viewList.id,
        })
      } */
    },
    saveList(obj) {
/*       this.$store.dispatch('list/saveList', {
        ...obj,
        id: this.viewList.id,
      }) */
    },
    removeDeferDate() {
      // this.listsaveList({deferDate: null})
    },
    removeRepeat(val) {
      // this.listsaveList({calendar: null})
    },
    removeHeaderTag(tagName) {
/*       this.$store.dispatch('list/removeListTag', {
        listId: this.viewList.id,
        tagId: this.listgetListTags.find(el => el.name === tagName).id,
      }) */
    },
    removeDeadline() {
      // this.listsaveList({deadline: null})
    }
  },
  computed: {
    icon() {return 'folder'},
    viewNameValue() {return this.viewName},
    getTasks() {
      return []
    },
    taskCompletionCompareDate() {
/*       if (this.viewList && this.viewList.calendar && this.viewList.calendar.type !== 'someday')
        return utils.getCalendarObjectData(this.viewList.calendar, mom()).lastCallEvent.format('Y-M-D')
      return null */
    },
    files() {
/*       if (this.viewList) {
        return {
          id: this.viewList.id,
          storageFolder: 'lists',
          files: this.viewList.files,
        }
      }
      return null */
    },
    tasksOrder() {
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
