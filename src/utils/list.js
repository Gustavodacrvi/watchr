
import utils from '@/utils'
import { pipeBooleanFilters } from '@/utils/memo'

import mom from 'moment'

export default {
  filterSidebarLists(rootGetters, lists, date) {
    return lists.filter(l =>
        !rootGetters['list/isListCompleted'](l) &&
        !rootGetters['list/isListCanceled'](l) &&
        !rootGetters['list/isListSomeday'](l) &&
        rootGetters['list/isListShowingOnDate'](l, date)
      )
  },
  listHeadingOptions(list, heading, store, tasks) {
    const li = list
    const listId = li.id
    const h = heading
    const dispatch = store.dispatch
    const toast = t => store.commit('pushToast', t)

    const headingTasks = tasks.slice()

    return [
      {
        name: 'Add notes',
        icon: 'note',
        callback: () => {
          dispatch('pushPopup', {
            comp: 'AddHeadingNote',
            payload: {
              listId, heading: h.id,
            },
            naked: true
          })
        },
      },
      {
        name: 'Uncomplete tasks',
        icon: 'circle',
        callback: () => dispatch('list/uncompleteHeadingTasks', {
          listId, headingId: h.id, savedTasks: store.getters['task/tasks'],
        })
      },
      {
        name: 'Duplicate heading',
        icon: 'copy',
        callback: () => dispatch('list/duplicateHeading', {
            listId, headingId: h.id, name, tasks: headingTasks.slice(),
          })
      },
      {
        name: "Convert to list",
        icon: 'tasks',
        important: true,
        callback: () => {
          if (store.getters['list/lists'].some(l => l.name === h.name))
            toast({
              name: 'There is already a list with this heading name.',
              seconds: 3,
              type: 'error',
            })
          else dispatch('list/convertHeadingToList', {
              listId, headingId: h.id, taskIds: headingTasks.map(el => el.id)
            })
        }
      },
      {
        name: 'Delete heading',
        icon: 'trash',
        important: true,
        callback: () => dispatch('list/deleteHeadingFromList', {
          listId, headingId: h.id, savedTasks: headingTasks,
        })
      },
    ]
  },
  listOptions: (vm, list, isInListView = false) => ({tasks, getters, dispatch, router}) => {
    const listId = list.id

    const isTaskInRoot = task => getters['task/isTaskInListRoot'](task)
    const isTaskInList = task => getters['task/isTaskInList'](task, listId)

    const rootTaskPipe = pipeBooleanFilters(
      isTaskInList,
      isTaskInRoot,
    )
    const headingsTaskPipe = pipeBooleanFilters(
      isTaskInList,
      task => !isTaskInRoot(task),
    )
    const pop = obj => dispatch('pushPopup', obj)
    const TOD_STR = mom().format('Y-M-D')
    
    const saveList = obj => {
      dispatch('list/saveList', {
        id: listId,
        ...obj,
      })
    }
    const saveCalendarDate = calendar => saveList({calendar})
    const saveSpecificDate = specific => saveCalendarDate({
      specific,
      type: 'specific',
      editDate: TOD_STR,
      begins: TOD_STR,
    })
    const deleteList = {
      name: 'Delete list',
      icon: 'trash',
      important: true,
      callback: () => {
        dispatch('list/deleteList', listId)
      }
    }

    const saveDeadline = deadline => saveList({deadline})
    
    const logbook = getters['list/isListInLogbook']
    const nonInListOptions = [
      {
        name: logbook ? 'Remove from logbook' : 'Log lists',
        icon: 'faded-logged-lists',
        callback: () => dispatch(logbook ? 'list/unlogLists' : 'list/logLists', [listId])
      },
      {
        type: 'optionsList',
        name: 'Deadline',
        options: [
          {
            icon: 'star',
            id: 'd',
            color: 'var(--yellow)',
            callback: () => saveDeadline(mom().format('Y-M-D')),
          },
          {
            icon: 'sun',
            id: 'çljk',
            color: 'var(--orange)',
            callback: () => saveDeadline(mom().add(1, 'day').format('Y-M-D')),
          },
          {
            icon: 'calendar',
            id: 'çljkasdf',
            color: 'var(--green)',
            callback: () => ({
              comp: 'CalendarPicker',
              content: {
                onlyDates: true,
                noTime: true,
                allowNull: true,
                callback: ({specific}) => {saveDeadline(specific,
                )}
              }
            })
          },
          {
            icon: 'bloqued',
            id: 'asdf',
            color: 'var(--red)',
            callback: () => saveDeadline(null),
          },
        ]
      },
      {
        type: 'optionsList',
        name: 'Schedule',
        options: [
          {
            icon: 'star',
            id: 'd',
            color: 'var(--yellow)',
            callback: () => saveSpecificDate(mom().format('Y-M-D')),
          },
          {
            icon: 'sun',
            id: 'çljk',
            color: 'var(--orange)',
            callback: () => saveSpecificDate(mom().add(1, 'day').format('Y-M-D')),
          },
          {
            icon: 'archive',
            id: 'açlkjsdffds',
            color: 'var(--brown)',
            callback: () => saveCalendarDate({
              type: 'someday',
              editDate: TOD_STR,
              begins: TOD_STR,
            })
          },
          {
            icon: 'calendar',
            id: 'çljkasdf',
            color: 'var(--green)',
            callback: () => {return {
              comp: "CalendarPicker",
              content: {repeat: true, disableDaily: true, callback: saveCalendarDate}}},
          },
          {
            id: 'asdf',
            icon: 'bloqued',
            color: 'var(--red)',
            callback: () => saveCalendarDate(null),
          }
        ]
      },
      {
        name: 'Edit list name',
        icon: 'pen',
        action: 'EDIT_SIDEBAR',
        callback: () => pop({comp: 'AddList', payload: {...list, editing: true}, naked: true})
      },
      {
        name: 'Move to folder',
        icon: 'folder',
        callback: () => utils.folderOptions(vm, saveList)
      },
      {
        name: 'Move to group',
        icon: 'group',
        callback: () => utils.groupOptions(vm, saveList)
      },
    ]
    
    let opt = [
      {
        name: "Toggle favorite",
        icon: 'heart',
        callback: () => {
          dispatch('list/saveList', {
            id: listId, favorite: !list.favorite,
          })
        }
      },
    ]


    if (!isInListView) {
      opt = [...nonInListOptions, ...opt]
      opt.unshift(      {
        name: 'Go to list',
        icon: 'tasks',
        callback: () => {
          router.push(`user?list=${list.name}`) 
        },
      })
    }
    
    const moreOptions = [
      {
        name: "Duplicate list",
        icon: 'copy',
        callback: () => {
          dispatch('list/duplicateList', {
            list, rootTasks: tasks.filter(rootTaskPipe), headingTasks: tasks.filter(headingsTaskPipe),
          })
        },
      },
    ]
    if (getters.isDesktopBreakPoint)
      moreOptions.push({
        name: "Export as template",
        icon: 'export',
        callback: l => {
          utils.exportListTemplate({
          list, tasks: tasks.filter(isTaskInList),
        })}
      })
    if (!isInListView) {
      opt.push(deleteList)
      opt = [...opt, {
        name: 'More options',
        icon: 'settings-h',
        callback: () => moreOptions
      }]
    } else {
      opt = [...opt, ...moreOptions]
      opt.push(deleteList)
    }

    return opt
  },
}
