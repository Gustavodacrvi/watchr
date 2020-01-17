
import utilsTask from '@/utils/task'
import utilsList from '@/utils/list'
import utilsFolder from '@/utils/folder'
import utils from '@/utils/'
import mom from 'moment'

export default {
  computed: {
    addTask() {
      return obj => {
        if (this.viewFolder) {
          this.$store.dispatch('folder/addTaskByIndex', {
            ...obj, folderId: this.viewFolder.id,
          })
        }
      }
    },
    rootFallbackItem() {
      return task => task
    },
    mainFallbackItem() {
      return (task, force) => {
        if (force || (!task.list && !task.folder && !task.heading))
          task.folder = this.viewFolder.id
        return task
      }
    },
    
    updateIds() {
      return ids => {
        if (this.viewFolder) {
          this.$store.dispatch('folder/saveFolder', {
            tasks: ids,
            id: this.viewFolder.id,
          })
        }
      }
    },
    saveHeaderName() {
      return name => {
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
      }
    },
    saveNotes() {
      return notes => {
        if (this.viewFolder) {
          this.$store.dispatch('folder/saveFolder', {
            notes, id: this.viewFolder.id,
          })
        }
      }
    },
    saveFolder() {
      return obj => {
        this.$store.dispatch('folder/saveFolder', {
          ...obj,
          id: this.viewFolder.id,
        })
      }
    },
    saveSchedule() {
      return info => localStorage.setItem('schedule_' + this.viewName, JSON.stringify(info))
    },
    
    
    mainFilter() {
      const fold = this.viewFolder
      if (fold)
        return task => this.isTaskInFolder(task, fold.id)
      return () => false
    },
    rootFilter() {
      return () => true
    },
    
    icon() {return 'folder'},
    viewNameValue() {return this.viewName},
    files() {
      const fold = this.viewFolder
      if (fold) {
        return {
          id: fold.id,
          storageFolder: 'folders',
          files: fold.files,
        }
      }
      return null
    },
    tasksOrder() {
      const fold = this.viewFolder
      if (fold && fold.tasks) {
        return fold.tasks
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
      const fold = this.viewFolder
      if (fold)
        return utilsFolder.getFolderOptions(fold)
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
    removeTaskHandlerWhenThereArentTasks() {
      return true
    },
    extraListView() {
      const fold = this.viewFolder
      const save = obj => {
        this.$store.dispatch('folder/saveFolder', {
          id: fold.id,
          ...obj,
        })
      }
      const dispatch = this.$store.dispatch
      
      if (fold)
        return {
          comp: 'ListHandler',
          rootFilter: list => fold.id === list.folder,
          itemsOrder: fold.order || [],
          updateIds: order => save({order}),
          addItem: obj => dispatch('list/addListInFolderByIndexFromView', {...obj, folderId: fold.id}),
        }
    },
  },
}
