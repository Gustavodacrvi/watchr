
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
    itemModelFallback() {
      if (this.viewFolder)
        return {
          folder: this.viewFolder.id,
          calendar: this.getCalObjectByView('Anytime'),
        }
    },
    getHeaderIcons() {
      return defaultIcons => defaultIcons.filter(({id}) => id !== 'heading')
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
    enableLogbook() {
      return true
    },
    headerPopup() {
      const folder = this.viewFolder
      if (folder)
        return {
          comp: 'AddFolder',
          payload: folder,
        }
    },
    headerInfo() {
      const folder = this.viewFolder
      if (!folder) return null

      const icons = []

      if (folder.color)
        icons.push({
            icon: 'tint',
            title: 'Folder color',
            color: folder.color,
            options: {
              comp: 'ColorPicker',
              content: {
                color: folder.color,
                callback: this.foldersaveFolder,
              },
            },
          })
      
      return {
        files: {
          names: folder.files || [],
          id: folder.id,
          save: files => this.foldersaveFolder({files}),
        },
        notes: {
          name: folder.notes || null,
          save: notes => this.foldersaveFolder({notes}),
        },
        icons,
      }
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
      
      if (fold)
        return {
          comp: 'ListHandler',
          folderId: fold.id,
          rootFilter: list => fold.id === list.folder,
          itemsOrder: fold.order || [],
          itemModelFallback: {
            folder: fold.id,
          },
          updateViewIds: functionFallbacks.updateOrderFunctions.FolderExtraView,
          mainFallbackItem: (...args) => {
            const l = this.listmainFallbackItem(...args)
            if (l.heading)
              delete l.heading
            if (l.list)
              delete l.list
            return l
          },
          
          fallbackFunctionData: () => ({
            folderId: fold.id
          }),
        }
    },
  },
}
