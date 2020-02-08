
import utilsGroup from '@/utils/group'

export default {
  computed: {
    addTask() {
      return obj => {
        if (this.viewGroup) {
          this.$store.dispatch('group/addTaskByIndex', {
            ...obj, groupId: this.viewGroup.id,
          })
        }
      }
    },
    rootFallbackItem() {
      return task => task
    },
    mainFallbackItem() {
      return (task, force) => {
        if (force || (!task.list && !task.group && !task.heading))
          task.group = this.viewGroup.id
        return task
      }
    },
    
    updateIds() {
      return ids => {
        if (this.viewGroup) {
          this.$store.dispatch('group/saveGroup', {
            order: ids,
            id: this.viewGroup.id,
          })
        }
      }
    },
    saveHeaderName() {
      return name => {
        if (this.viewGroup) {
/*           if (this.$store.getters['group/getGroupsByName']([name])[0])
            this.pushToast({
              name: 'This group already exists!',
              seconds: 4,
              type: 'error',
            })
          else {
            this.$router.push('/user?group='+name)
            this.$store.dispatch('group/saveGroup', {
              name,
              id: this.viewGroup.id,
            })
          } */
        }
      }
    },
    saveNotes() {
      return notes => {
/*         if (this.viewGroup) {
          this.$store.dispatch('group/saveGroup', {
            notes, id: this.viewGroup.id,
          })
        } */
      }
    },
    saveGroup() {
      return obj => {
        /* this.$store.dispatch('group/saveGroup', {
          ...obj,
          id: this.viewGroup.id,
        }) */
      }
    },
    saveSchedule() {
      return info => localStorage.setItem('schedule_' + this.viewName, JSON.stringify(info))
    },
    
    
    mainFilter() {
      const group = this.viewGroup
      if (group)
        return task => this.isTaskInGroup(task, group.id)
      return () => false
    },
    rootFilter() {
      return () => true
    },
    
    icon() {return 'group'},
    viewNameValue() {return this.viewName},
    files() {
      const group = this.viewGroup
      if (group) {
        return {
          id: group.id,
          storageGroup: 'groups',
          files: group.files || [],
        }
      }
      return null
    },
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
    savedSchedule() {
      const schedule = localStorage.getItem('schedule_' + this.viewName)
      return schedule !== 'null' ? JSON.parse(schedule) : null
    },
    removeListHandlerWhenThereArentLists() {
      return true
    },
    extraListView() {
      const gro = this.viewGroup
      const save = obj => {
/*         this.$store.dispatch('group/saveGroup', {
          id: gro.id,
          ...obj,
        }) */
      }
      const dispatch = this.$store.dispatch
      
      if (gro)
        return {
          comp: 'ListHandler',
          groupId: gro.id,
          rootFilter: list => gro.id === list.group,
          itemsOrder: gro.order || [],
          updateIds: order => save({order}),
          addItem: obj => dispatch('list/addListInGroupByIndexFromView', {...obj, groupId: gro.id}),
        }
    },
  },
}
