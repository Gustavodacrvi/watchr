
import utilsTask from '@/utils/task'
import utils from '@/utils/'
import mom from 'moment'

export default {
  methods: {
    addTask(obj) {
      if (this.viewList) {
        if (!obj.task.list)
          obj.task.list = this.viewList.id
        obj.task.users = this.viewList.users
        this.$store.dispatch('list/addTaskByIndex', {
          ...obj, listId: this.viewList.id
        })
      }
    },
    updateIds(ids) {
      if (this.viewList) {
        this.$store.dispatch('list/saveList', {
          tasks: ids,
          id: this.viewList.id,
        })
      }
    },
    updateHeadingIds(ids) {
      if (this.viewList) {
        this.$store.dispatch('list/updateListHeadings', {
          listId: this.viewList.id,
          ids,
        })
      }
    },
    saveHeaderName(name) {
      if (this.viewList) {
        this.$router.push('/user?list='+name)
        this.$store.dispatch('list/saveList', {
          name,
          id: this.viewList.id,
        })
      }
    },
    saveNotes(notes) {
      if (this.viewList) {
        this.$store.dispatch('list/saveList', {
          notes, id: this.viewList.id,
        })
      }
    },
    addHeading(obj) {
      if (this.viewList) {
        this.$store.dispatch('list/addHeading', {...obj, listId: this.viewList.id})
      }
    },
    onSortableAdd(evt, taskIds, type, ids) {
      if (this.viewList) {
        this.$store.dispatch('list/removeTasksFromHeading', {
          taskIds, ids, listId: this.viewList.id,
        })
      }
    },
  },
  computed: {
    icon() {return 'tasks'},
    viewNameValue() {return this.viewName},
    getTasks() {
      return this.getRootTasksOfList
    },
    tasksOrder() {
      return this.viewList.tasks
    },
    headingsOptions() {
      const arr = []
      const viewList = this.viewList
      let order = viewList.headingsOrder
      if (!order) order = []
      
      const heads = utils.checkMissingIdsAndSortArr(order, viewList.headings, 'name')
      
      for (const h of heads) {
        let headingTasks = this.getListTasks.filter(el => el.heading === h.name)
        headingTasks= utils.checkMissingIdsAndSortArr(h.tasks, headingTasks)
        arr.push({
          name: h.name,
          allowEdit: true,
          showHeadingName: false,
          onEdit: (name) => {
            this.$store.dispatch('list/saveHeadingName', {
              listId: this.viewList.id,
              oldName: h.name,
              newName: name,
              tasksIds: headingTasks.map(el => el.id)
            })
          },
          filter: (a, h, showCompleted) => {
            let tasks = headingTasks.slice()

            if (!showCompleted)
              tasks = utilsTask.filterTasksByCompletion(tasks, true)
            
            return tasks
          },
          id: h.name,
          autoHide: h.autoHide,
          optionClick: (iconName) => {
            switch (iconName) {
              case 'archive': {
                this.$store.dispatch('list/toggleHeadingAuthide', {
                  listId: this.viewList.id,
                  name: h.name,
                })
                break
              }
            }
          },
          options: [
            {
              name: this.l['Edit heading'],
              icon: 'pen',
              callback: (j, vm, l) => {
                vm.$emit('edit')
              }
            },
            {
              name: this.l['Hide heading'],
              icon: 'archive',
              callback: () => this.$store.dispatch('list/toggleHeadingAuthide', {
                listId: this.viewList.id,
                name: h.name,
              })
            },
            {
              name: this.l['Uncomplete tasks'],
              icon: 'circle',
              callback: () => this.$store.dispatch('list/uncompleteHeadingTasks', {
                listId: this.viewList.id,
                name: h.name, savedTasks: this.tasks,
              })
            },
            {
              name: this.l['Duplicate heading'],
              icon: 'copy',
              callback: () => {
                this.$store.dispatch('list/duplicateHeading', {
                  name: h.name, listId: viewList.id, tasks: headingTasks.slice(),
                })
              }
            },
            {
              name: this.l["Convert to list"],
              icon: 'tasks',
              important: true,
              callback: () => {
                if (this.lists.some(l => l.name === h.name))
                  this.$store.commit('pushToast', {
                    name: this.l['There is already a list with this heading name.'],
                    seconds: 3,
                    type: 'error',
                  })
                else 
                  this.$store.dispatch('list/convertHeadingToList', {
                    name: h.name, listId: viewList.id, taskIds: headingTasks.map(el => el.id)
                  })
              }
            },
            {
              name: this.l['Delete heading'],
              icon: 'trash',
              important: true,
              callback: () => {
                this.$store.dispatch('list/deleteHeadingFromList', {
                  listId: this.viewList.id,
                  name: h.name, savedTasks: this.tasks,
                })
              },
            },
          ],
          updateIds: ids => {
            this.$store.dispatch('list/updateHeadingsTaskIds', {
              name: h.name, listId: viewList.id, ids,
            })
          },
          onAddTask: obj => {
            obj.task.users = this.viewList.users
            this.$store.dispatch('list/addTaskHeading', {
              name: obj.header.name, ids: obj.ids, listId: viewList.id, task: obj.task, index: obj.index,
            })
          },
          onSortableAdd: (evt, taskIds, type, ids) => {
            this.$store.dispatch('list/moveTasksBetweenHeadings', {
              taskIds, ids, name: h.name, listId: viewList.id,
            })
          }
        })
      }

      return arr
    },
    illustration() {
      const l = this.l
      return {
        name: 'EmptyList',
        title: l["This list doesn't have any tasks."],
        descr: l["You can add tasks and headings by dropping the floating buttons here."],
        width: '150px',
      }
    },
    headerOptions() {
      let opt = []
      opt = [
        {
          name: this.l['Edit list'],
          icon: 'pen',
          callback: () => {
            this.$store.dispatch('pushPopup', {comp: 'AddList', payload: {...this.viewList, editing: true}})
          }
        },
        {
          name: this.l["Duplicate list"],
          icon: 'copy',
          callback: () => {
            this.$store.dispatch('list/duplicateList', {
              list: this.viewList, rootTasks: this.getRootTasksOfList,
              headingTasks: this.getTasksWithHeading,
            })
          }
        },
      ]
      if (!this.viewList.notes)
        opt.push({
          name: this.l['Add notes'],
          icon: 'note',
          callback: () => this.$store.dispatch('pushPopup', {
            comp: 'AddListNote',
            payload: this.viewList.id,
          })
        })
      if (this.isDesktop)
        opt.push({
          name: this.l["Export as template"],
          icon: 'export',
          callback: () => utils.exportListTemplate({
            list: this.viewList,
            tasks: this.getListTasks
          })
        })
      return opt
    },
    headingEdit() {
      if (this.viewList)
        return {
          excludeNames: this.viewList.headings.map(el => el.name),
          errorToast: "There's already another heading with this name.",
        }
      return []
    },
    getViewNotes() {
      if (this.viewList)
        return this.viewList.notes
      return null
    },
    getPieProgress() {
      return this.$store.getters['list/pieProgress'](this.tasks, this.viewList.id)
    },
  },
}
