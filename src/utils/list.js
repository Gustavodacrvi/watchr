
export default {
  listHeadingOptions(list, heading, store, headingTasks, l) {
    const li = list
    const listId = li.id
    const h = heading
    const dispatch = store.dispatch
    const toast = t => store.commit('pushToast', t)
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
        name: l['Hide heading'],
        icon: 'archive',
        callback: () => dispatch('list/toggleHeadingAuthide', {
          listId, name: h.name,
        })
      },
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
            listId, name: h.name, savedTasks: tasks,
          })
      },
    ]
  },
  listOptions(list, store, getListTasks, l) {
    const dispatch = store.dispatch
    const getters = store.getters
    const rootTasks = getters['task/getRootTasksOfList'](getListTasks, list)
    const headingTasks = getters['task/getTasksWithHeading'](getListTasks, list.id)
    const listId = list.id
    const pop = obj => dispatch('pushPopup', obj)
    const opt = [
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
            name: l['Defer date'],
            icon: 'calendar',
            callback: () => {return {calendar: true, callback: date => {
              if (date.type === 'specific')
                dispatch('list/saveList', {
                  id: listId, deferDate: date.specific,
                })
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
            name: l['Add tags'],
            icon: 'tag',
            callback: () => ({
              search: true,
              links: store.state.tag.tags.map(el => ({
                name: el.name,
                icon: 'tag',
                callback: () => dispatch('list/addListTag', {tagId: el.id, listId}),
              })),
            }),
          },
        ]
      },
      {
        name: l["Duplicate list"],
        icon: 'copy',
        callback: () => {
          dispatch('list/duplicateList', {
            list, rootTasks, headingTasks,
          })
        }
      },
    ]
    if (store.getters.isDesktop)
      opt.push({
        name: l["Export as template"],
        icon: 'export',
        callback: () => utils.exportListTemplate({
          list, tasks: getListTasks,
        })
      })
    opt.push(          {
      name: l['Delete list'],
      icon: 'trash',
      important: true,
      callback: () => dispatch('list/deleteList', {
        listId, tasks: getListTasks,
      })
    })
    return opt
  },
}
