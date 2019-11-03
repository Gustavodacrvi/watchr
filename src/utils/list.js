
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
        name: l['Hide heading'],
        icon: 'archive',
        callback: () => dispatch('list/toggleHeadingAuthide', {
          listId: viewList.id,
          name: h.name,
        })
      },
      {
        name: l['Uncomplete tasks'],
        icon: 'circle',
        callback: () => dispatch('list/uncompleteHeadingTasks', {
          listId, name: h.name, savedTasks: tasks,
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
          if (lists.some(l => l.name === h.name))
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
}
