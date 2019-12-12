
import utils from '@/utils'
import { pipeBooleanFilters } from '@/utils/memo'

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
        name: l['Edit heading'],
        icon: 'pen',
        callback: (j, vm, l) => {
          vm.$emit('edit')
        }
      },
      {
        name: l['Add notes'],
        icon: 'note',
        callback: () => {
          dispatch('pushPopup', {
            comp: 'AddHeadingNote',
            payload: {
              listId, heading: heading.name,
            }
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
              listId, name: h.name, savedTasks: store.state.task.tasks,
            })
          },
          {
            name: l['Duplicate heading'],
            icon: 'copy',
            callback: () => dispatch('list/duplicateHeading', {
                listId, name: h.name, tasks: headingTasks.slice(),
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
                  listId, name: h.name, taskIds: headingTasks.map(el => el.id)
                })
            }
          },
          {
            name: l['Delete heading'],
            icon: 'trash',
            important: true,
            callback: () => dispatch('list/deleteHeadingFromList', {
              listId, name: h.name, savedTasks: headingTasks,
            })
          },
        ]
      }
    ]
  },
  listOptions: list => ({tasks, getters, dispatch}) => {
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
    let opt = [
      {
        name: l["Edit list"],
        icon: 'pen',
        callback: () => [
          {
            name: l['Edit list name'],
            icon: 'pen',
            callback: () => pop({comp: 'AddList', payload: {...list, editing: true}})
          },
          {
            name: l['Repeat list'],
            icon: 'repeat',
            callback: () => {return {
              comp: 'CalendarPicker',
              content: {callback: date => {
              if (date.type && date.type !== 'specific' && date.type !== 'someday') {
                dispatch('list/saveList', {
                  id: listId, calendar: date,
                })}
              }
            }}},
          },
          {
            name: l['Defer date'],
            icon: 'sleep',
            callback: () => {return {
              comp: 'CalendarPicker',
              content: {callback: date => {
              if (date.type === 'specific')
                dispatch('list/saveList', {
                  id: listId, deferDate: date.specific,
                })}
            }}},
          },
          {
            name: l['Add notes'],
            icon: 'note',
            callback: () => dispatch('pushPopup', {
              comp: 'AddListNote',
              payload: listId,
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
              links: store.state.tag.tags.map(el => ({
                name: el.name,
                icon: 'tag',
                callback: () => dispatch('list/addListTag', {tagId: el.id, listId}),
              })),
            }),
          },
          {
            name: l['Add deadline'],
            icon: 'deadline',
            callback: () => {return {
              comp: 'CalendarPicker',
              content: {callback: date => {
              if (date.type === 'specific')
                dispatch('list/saveList', {
                  id: listId, deadline: date.specific,
                })}
            }}},
          },
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
