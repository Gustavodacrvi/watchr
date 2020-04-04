
import utilsGroup from '@/utils/group'

import functionFallbacks from '@/utils/functionFallbacks.js'

export default {
  computed: {
    rootFallbackItem() {
      return t => t
    },
    mainFallbackItem() {
      return (t, f) => functionFallbacks.viewFallbacks.Group(t, f, this.viewGroup.id)
    },
    updateIds() {
      return functionFallbacks.updateOrderFunctions.Group
    },
    fallbackFunctionData() {
      return () => ({
        groupId: this.viewGroup.id,
      })
    },
    itemModelFallback() {
      if (this.viewGroup)
        return {
          group: this.viewGroup.id,
        }
    },

    saveHeaderName() {
      return name => {
        if (this.viewGroup) {
          if (this.$store.getters['group/getGroupsByName']([name])[0])
            this.pushToast({
              name: 'This group already exists!',
              seconds: 4,
              type: 'error',
            })
          else {
            this.$router.push('/user?group='+name)
            this.$store.dispatch('group/saveGroupName', {
              name,
              id: this.viewGroup.id,
            })
          }
        }
      }
    },
    getViewNotes() {
      const gro = this.viewGroup
      if (gro)
        return gro.notes
      return null
    },
    headerInfo() {
      const group = this.viewGroup
      if (!group)
        return undefined
      
      const save = this.groupsaveGroup

      return {
        comments: group.id ? {
          group: group.id,
          room: group.id,
        } : undefined,
        icons: [
          {
            icon: 'tint',
            title: 'Group color',
            color: group.color,
            options: {
              comp: 'ColorPicker',
              content: {
                color: group.color,
                callback: save,
              },
            },
          },
        ],
        notes: {
          name: group.notes || null,
          save: notes => {
            this.$store.dispatch('group/saveGroup', {
              notes, id: this.viewGroup.id,
            })
          },
        },
        files: {
          names: group.files || [],
          storageFolder: 'groups',
          id: group.id,
          save: files => save({files}),
        },
      }
    },
    saveGroup() {
      return obj => {
        this.$store.dispatch('group/saveGroup', {
          ...obj,
          id: this.viewGroup.id,
        })
      }
    },
    
    
    mainFilter() {
      const group = this.viewGroup
      if (group)
        return task => this.isTaskInGroup(task, group.id)
      return () => false
    },
    rootFilter() {
      return task => !task.list
    },
    
    icon() {return 'group'},
    viewNameValue() {return this.viewName},
    tasksOrder() {
      const group = this.viewGroup
      if (group && group.order) {
        return group.order
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
      const group = this.viewGroup
      if (group)
        return utilsGroup.getGroupOptions(group)
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
    viewItem() {
      return this.viewGroup
    },
    extraListView() {
      const gro = this.viewGroup
      const save = obj => {
        this.$store.dispatch('group/saveGroup', {
          id: gro.id,
          ...obj,
        })
      }
      const dispatch = this.$store.dispatch
      
      if (gro)
        return {
          comp: 'ListHandler',
          groupId: gro.id,
          rootFilter: list => gro.id === list.group,
          itemsOrder: gro.listsOrder || [],
          updateIds: listsOrder => save({listsOrder}),
          addItem: obj => dispatch('list/addListInGroupByIndexFromView', {...obj, groupId: gro.id}),
        }
    },
  },
}
