
import utils from '@/utils'
import { pipeBooleanFilters } from '@/utils/memo'

import mom from 'moment'

export default {
  listHeadingOptions(list, heading, store, tasks, l) {
    const li = list
    const listId = li.id
    const h = heading
    const dispatch = store.dispatch
    const toast = t => store.commit('pushToast', t)

    const headingTasks = tasks.slice()

    return [
      {
        name: l['Add notes'],
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
        name: l['More options'],
        icon: 'settings-h',
        callback: () => [
          {
            name: l['Uncomplete tasks'],
            icon: 'circle',
            callback: () => dispatch('list/uncompleteHeadingTasks', {
              listId, headingId: h.id, savedTasks: store.getters['task/tasks'],
            })
          },
          {
            name: l['Duplicate heading'],
            icon: 'copy',
            callback: () => dispatch('list/duplicateHeading', {
                listId, headingId: h.id, name, tasks: headingTasks.slice(),
              })
          },
          {
            name: l["Convert to list"],
            icon: 'tasks',
            important: true,
            callback: () => {
              if (store.state.list.lists.some(l => l.name === h.name))
                toast({
                  name: l['There is already a list with this heading name.'],
                  seconds: 3,
                  type: 'error',
                })
              else dispatch('list/convertHeadingToList', {
                  listId, headingId: h.id, taskIds: headingTasks.map(el => el.id)
                })
            }
          },
          {
            name: l['Delete heading'],
            icon: 'trash',
            important: true,
            callback: () => dispatch('list/deleteHeadingFromList', {
              listId, headingId: h.id, savedTasks: headingTasks,
            })
          },
        ]
      }
    ]
  },
  listOptions: list => ({tasks, getters, dispatch, router}) => {
    const l = getters['l']
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
    
    let opt = [
      {
        name: 'Go to list',
        icon: 'tasks',
        callback: () => {
          router.push(`user?list=${list.name}`) 
        },
      },
      {
        name: 'Deadline',
        icon: 'deadline',
        callback: () => ({
          comp: 'CalendarPicker',
          content: {
            onlyDates: true,
            noTime: true,
            allowNull: true,
            callback: ({specific}) => saveList({deadline: specific})
          }
        })
      },
      {
        name: l['No date'],
        icon: 'bloqued',
        callback: () => saveCalendarDate(null)
      },
      {
        type: 'optionsList',
        name: 'Schedule',
        options: [
          {
            icon: 'star',
            id: 'd',
            callback: () => saveSpecificDate(mom().format('Y-M-D')),
          },
          {
            icon: 'sun',
            id: 'çljk',
            callback: () => saveSpecificDate(mom().add(1, 'day').format('Y-M-D')),
          },
          {
            icon: 'archive',
            id: 'açlkjsdffds',
            callback: () => saveCalendarDate({
              type: 'someday',
              editDate: TOD_STR,
              begins: TOD_STR,
            })
          },
          {
            icon: 'calendar',
            id: 'çljkasdf',
            callback: () => {return {
              comp: "CalendarPicker",
              content: {repeat: true, disableDaily: true, callback: saveCalendarDate}}},
          },
        ]
      },
      {
        name: l["Edit list"],
        icon: 'pen',
        callback: () => [
          {
            name: l['Edit list name'],
            icon: 'pen',
            callback: () => pop({comp: 'AddList', payload: {...list, editing: true}, naked: true})
          },
/*           {
            name: l['Repeat list'],
            icon: 'repeat',
            callback: () => {return {
              comp: 'CalendarPicker',
              content: {callback: date => {
              if (date && date.type && date.type !== 'specific' && date.type !== 'someday') {
                dispatch('list/saveList', {
                  id: listId, calendar: date,
                })
              }
              else if (date === null)
                dispatch('list/saveList', {
                  id: listId, calendar: null,
                })
              }
            }}},
          }, */
/*           {
            name: l['Defer date'],
            icon: 'sleep',
            callback: () => {return {
              comp: 'CalendarPicker',
              content: {callback: date => {
              if (date && date.type === 'specific')
                dispatch('list/saveList', {
                  id: listId, deferDate: date.specific,
                })
              else if (date === null)
                dispatch('list/saveList', {
                  id: listId, deferDate: null,
                })
              }
            }}},
          }, */
          {
            name: l['Add notes'],
            icon: 'note',
            callback: () => dispatch('pushPopup', {
              comp: 'AddListNote',
              payload: listId,
              naked: true
            })
          },
          {
            name: l['Add files'],
            icon: 'file',
            callback: () => ({
              comp: 'Files',
              content: {
                storageFolder: 'lists',
                id: listId,
                savedFiles: list.files ? list.files : [],
                callback: files => {
                  dispatch('list/saveList', {
                    id: listId, files,
                  })
                }
              },
            }),
          },
          {
            name: l['Add tags'],
            icon: 'tag',
            callback: () => ({
              allowSearch: true,
              links: store.getters['tag/tags'].map(el => ({
                name: el.name,
                icon: 'tag',
                callback: () => dispatch('list/addListTag', {tagId: el.id, listId}),
              })),
            }),
          },
/*           {
            name: l['Add deadline'],
            icon: 'deadline',
            callback: () => {return {
              comp: 'CalendarPicker',
              content: {callback: date => {
              if (date && date.type === 'specific')
                dispatch('list/saveList', {
                  id: listId, deadline: date.specific,
                })
              else if (date === null)
                dispatch('list/saveList', {
                  id: listId, deadline: null,
                })
              }
            }}},
          }, */
        ]
      },
      {
        name: l["Toggle favorite"],
        icon: 'heart',
        callback: () => {
          dispatch('list/saveList', {
            id: listId, favorite: !list.favorite,
          })
        }
      },
    ]
    const moreOptions = [
      {
        name: l["Duplicate list"],
        icon: 'copy',
        callback: () => {
          dispatch('list/duplicateList', {
            list, rootTasks: tasks.filter(rootTaskPipe), headingTasks: tasks.filter(headingsTaskPipe),
          })
        }
      },
    ]
    if (getters.isDesktop)
      moreOptions.push({
        name: l["Export as template"],
        icon: 'export',
        callback: l => {
          utils.exportListTemplate({
          list, tasks: tasks.filter(isTaskInList),
        })}
      })
    moreOptions.push({
      name: l['Delete list'],
      icon: 'trash',
      important: true,
      callback: () => {
        dispatch('list/deleteList', {
          listId, tasks: tasks.filter(isTaskInList),
        })
      }
    })
    opt = [...opt, {
      name: l['More options'],
      icon: 'settings-h',
      callback: () => moreOptions
    }]
    return opt
  },
}
