
import utilsTask from '@/utils/task'
import utilsList from '@/utils/list'
import momUtils from '@/utils/moment'
import { pipeBooleanFilters, memoize } from '@/utils/memo'
import utils from '@/utils/'
import mom from 'moment'

const TOD_DATE = mom().format('Y-M-D')

import functionFallbacks from '@/utils/functionFallbacks.js'

export default {
  computed: {
    rootFallbackItem() {
      return functionFallbacks.viewPositionFallbacks.listRoot
    },
    fallbackFunctionData() {
      return () => ({
        listId: this.viewList.id,
        groupId: this.viewList.group,
      })
    },
    mainFallbackItem() {
      return (t, f) => functionFallbacks.viewFallbacks.List(t, f, {
        listId: this.viewList.id,
        groupId: this.viewList.group,
        listTagIds: this.listgetListTags.map(el => el.id),
      })
    },
    rootFilter() {
      return this.isTaskInListRoot
    },
    updateIds() {
      return functionFallbacks.updateOrderFunctions.List
    },

    saveHeaderName() {
      return name => {
        if (this.viewList) {
          if (this.getListByName(name))
            this.pushToast({
              name: 'This list already exists!',
              seconds: 4,
              type: 'error',
            })
          else {
            this.$router.push('/user?list='+name)
            this.$store.dispatch('list/saveList', {
              name,
              id: this.viewList.id,
            })
          }
        }
      }
    },
    saveNotes() {
      return notes => {
        if (this.viewList) {
          this.$store.dispatch('list/saveList', {
            notes, id: this.viewList.id,
          })
        }
      }
    },
    addHeading() {
      return obj => {
        if (this.viewList) {
          this.$store.dispatch('list/addHeading', {...obj, listId: this.viewList.id})
        }
      }
    },
    onSortableAdd() {
      return (taskIds, ids) => {
        if (this.viewList) {
          this.$store.dispatch('list/removeTasksFromHeading', {
            taskIds, ids, listId: this.viewList.id,
          })
        }
      }
    },
    saveList() {
      return obj => {
        this.$store.dispatch('list/saveList', {
          ...obj,
          id: this.viewList.id,
        })
      }
    },
    removeDeferDate() {
      return () => this.listsaveList({deferDate: null})
    },
    removeRepeat() {
      return () => this.listsaveList({calendar: null})
    },
    removeHeaderTag() {
      return tagName => {
        this.$store.dispatch('list/removeListTag', {
          listId: this.viewList.id,
          tagId: this.listgetListTags.find(el => el.name === tagName).id,
        })
      }
    },
    removeDeadline() {
      this.listsaveList({deadline: null})
    },

    removeDeadline() {},
    removeDeferDate() {},
    
    
    mainFilter() {
      const list = this.viewList
      if (list) {
        return task => this.isTaskInList(task, list.id)
      }
      return () => false
    },
    headings() {
      const arr = []
      const viewList = this.viewList
      if (viewList) {
        const headings = this.$store.getters['list/getListHeadingsById'](viewList.id)
        for (const h of headings) {
          const pipedFilter = task => this.isTaskInHeading(task, h)

          arr.push({
            name: h.name,
            id: h.id,
            allowEdit: true,
            showHeadingName: false,
            notes: h.notes,
            calendarStr: true,

            onEdit: tasks => name => {
              this.$store.dispatch('list/saveHeadingName', {
                name,
                listId: viewList.id,
                headingId: h.id,
              })
            },
            sort: this.sortArray,
            order: h.tasks,
            filter: pipedFilter,
            options: tasks => {
              return utilsList.listHeadingOptions(viewList, h, this.$store, tasks, this.l)
            },
            fallbackFunctionData: () => ({
              listId: viewList.id,
              headingId: h.id,
            }),
            fallbackItem: functionFallbacks.viewPositionFallbacks.listHeading,
            updateViewIds: functionFallbacks.updateOrderFunctions.listHeading,

            saveNotes: notes => {
              this.$store.dispatch('list/saveHeadingNotes', {
                listId: viewList.id, notes, heading: h.id,
              })
            },
          })
        }
      }
      return arr
    },
    headingsOrder() {
      const list = this.viewList
      if (list && list.headingsOrder)
        return list.headingsOrder
      return []
    },
    
    icon() {
      return this.isViewListSomeday ? 'archive' : 'tasks'
    },
    viewNameValue() {return this.viewName},
    updateHeadingIds() {
      const list = this.viewList
      if (list) {
        return ids => {
          this.$store.dispatch('list/updateListHeadings', {
            listId: list.id,
            ids,
          })
        }
      }
      return null
    },
    tasksOrder() {
      const list = this.viewList
      if (list && list.tasks)
        return list.tasks
      return []
    },
    showEmptyHeadings() {
      return true
    },
    showAllHeadingsItems() {
      return true
    },
    getListTags() {
      const list = this.viewList
      if (list && list.tags)
        return this.getTagsById(list.tags)
      return []
    },
    headerInfo() {
      const list = this.viewList
      if (!list)
        return null
      
      const listId = list.id
      const parseDate = utils.getHumanReadableDate

      const specificDate = list.calendar ? utils.parseCalendarObjectToString(list.calendar, this.userInfo) : null
      
      let deadlineStr = list.deadline ? parseDate(list.deadline) : null
      if (deadlineStr === 'Today')
        deadlineStr = null

      const save = this.listsaveList
      const dispatch = this.$store.dispatch
      
      if (list)
        return {
          comments: list.group ? {
            group: list.group,
            room: list.id,
          } : undefined,
          files: {
            names: list.files || [],
            storageFolder: 'lists',
            id: list.id,
            save: files => save({files}),
          },
          notes: {
            name: list.notes || null,
            save: this.listsaveNotes,
          },
          tags: {
            names: this.listgetListTags.map(el => el.name),
            remove: name => dispatch('list/removeListTag', {
              list,
              tagId: this.listgetListTags.find(el => el.name === name).id
            }),
          },
          icons: [
            {
              icon: 'deadline',
              content: deadlineStr,
              title: 'Add deadline',
              right: list.deadline ? this.getListDeadlineDaysLeftStr(list.deadline, TOD_DATE) : null,
              options: {
                comp: 'CalendarPicker',
                content: {
                  onlyDates: true,
                  noTime: true,
                  allowNull: true,
                  callback: ({specific}) => save({deadline: specific})
                },
              },
            },
            {
              icon: 'calendar',
              content: specificDate,
              title: 'Add date',
              options: {
                comp: "CalendarPicker",
                content: {repeat: true, disableDaily: true, callback: calendar => save({calendar})}},
            },
            {
              icon: 'tag',
              title: 'Add tags',
              options: {
                allowSearch: true,
                select: true,
                onSave: names => {
                  dispatch('list/editListTags', {
                    tagIds: this.tags.filter(el => names.includes(el.name)).map(el => el.id),
                    listId,
                  })
                },
                selected: (list.tags && list.tags.map(id => this.tags.find(el => el.id === id).name)) || [],
                links: this.tags.map(el => ({
                  name: el.name,
                  icon: 'tag',
                })),
              },
            },
          ]
        }
    },
    saveHeaderContent() {
      const save = obj => {
        this.$store.dispatch('list/saveList', {
          id: this.viewList.id,
          ...obj
        })
      }
      
      return obj => {
        if (obj.deadline !== undefined)
          save(obj)
      }
    },
    headerOptions() {
      const list = this.viewList
      if (list)
        return utilsList.listOptions(list, true)
      return null
    },
    headingEditOptions() {
      const list = this.viewList
      if (list) {
        const headings = list.headings || []
        return {
          excludeNames: headings.map(el => el.name),
          errorToast: "There's already another heading with this name.",
          placeholder: 'Heading name...',
        }
      }
      return null
    },
    getViewNotes() {
      const list = this.viewList
      if (list)
        return list.notes
      return null
    },
    itemCompletionCompareDate() {
      const list = this.viewList
      const c = list && list.calendar
      return c && momUtils.getNextEventAfterCompletionDate(c).format('Y-M-D')
    },
    viewItem() {
      return this.viewList
    },
    getPieProgress() {
      const list = this.viewList
      if (list && !this.isViewListSomeday)
        return this.$store.getters['list/pieProgress'](this.$store.getters['task/allTasks'], list.id, task => this.isTaskInView(task, "Logbook"))
      return null
    },
  },
}
