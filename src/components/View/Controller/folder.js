
import utilsFolder from '@/utils/folder'

import functionFallbacks from '@/utils/functionFallbacks.js'


export default {
  computed: {
    rootFallbackItem() {
      return t => t
    },
    mainFallbackItem() {
      return (t, f) => functionFallbacks.viewFallbacks.Folder(t, f, this.viewFolder.id)
    },
    fallbackFunctionData() {
      return () => ({
        folderId: this.viewFolder.id,
      })
    },
    updateIds() {
      return functionFallbacks.updateOrderFunctions.Folder
    },

    saveHeaderName() {
      return name => {
        if (this.viewFolder) {
          if (this.$store.getters['folder/getFoldersByName']([name])[0])
            this.pushToast({
              name: 'This folder already exists!',
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
    removeListHandlerWhenThereArentLists() {
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
          folderId: fold.id,
          rootFilter: list => fold.id === list.folder,
          itemsOrder: fold.order || [],
          updateIds: order => save({order}),
          addItem: obj => dispatch('list/addListInFolderByIndexFromView', {...obj, folderId: fold.id}),
        }
    },
  },
}
