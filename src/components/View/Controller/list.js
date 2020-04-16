
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
    itemModelFallback() {
      if (this.viewList)
        return {
          group: this.viewList.group || null,
          list: this.viewList.id,
          calendar: this.getCalObjectByView('Anytime'),
        }
    },
    getHeaderIcons() {
      return defaultIcons => defaultIcons.filter(({id}) => id !== 'list')
    },

    saveHeaderName() {
      return name => {
        if (this.viewList) {
          if (this.getListsByName([name])[0])
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

          const save = obj => {
            this.$store.dispatch('list/saveHeading', {
              listId: viewList.id,
              headingId: h.id,
              heading: obj,
            })
          }

          arr.push({
            name: h.name,
            id: h.id,
            allowEdit: true,
            showHeadingName: false,
            notes: h.notes,
            calendarStr: true,
            archive: h.archive,

            color: h.color,
            icons: [
              {
                icon: 'archive',
                click: () => save({archive: !h.archive}),
              },
              {
                icon: 'tint',
                color: h.color,
                options: {
                  comp: 'ColorPicker',
                  content: {
                    color: h.color,
                    callback: save,
                  },
                },
              },
            ],

            onEdit: tasks => name => save({name}),
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
            itemModelFallback: {heading: h.id},

            saveNotes: notes => save({notes}),
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
    enableLogbook() {
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
    headerPopup() {
      const list = this.viewList
      if (list)
        return {
          comp: "AddList",
          payload: list,
        }
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

      const icons = []

      if (list.deadline)
        icons.unshift({
          icon: 'deadline',
          content: deadlineStr,
          color: 'var(--red)',
          right: list.deadline ? this.getListDeadlineDaysLeftStr(list.deadline, TOD_DATE) : null,
          options: {
            comp: 'CalendarPicker',
            content: {
              onlyDates: true,
              noTime: true,
              allowNull: true,
              callback: date => save({deadline: (date && date.specific) || null}),
            },
          },
        })
        
      if (list.calendar)
        icons.push({
          icon: 'calendar',
          content: specificDate,
          color: 'var(--green)',
          options: {
            comp: "CalendarPicker",
            content: {repeat: true, disableDaily: true,
              callback: calendar => save({calendar})
            }},
        })

      if (list.tint)
        icons.push({
          icon: 'tint',
          title: 'List color',
          color: list.color,
          options: {
            comp: 'ColorPicker',
            content: {
              color: list.color,
              callback: this.listsaveList,
            },
          },
        })

      const obj = {
        comments: list.group ? {
          group: list.group || null,
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
        icons,
      }
      
      return obj
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
        return utilsList.listOptions(this, list, true)
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
        return this.$store.getters['list/pieProgress'](list.id)
      return null
    },
  },
}
