

export default {
  tagOptions(tag, store, l) {
    const dispatch = store.dispatch
    const opt = [
      {
        name: l['Edit tag'],
        icon: 'pen',
        callback: () => dispatch('pushPopup', {
            comp: 'AddTag', payload: {...tag, editing: true}
          })
      },
    ]
    if (!tag.notes)
      opt.push({
        name: l['Add notes'],
        icon: 'note',
        callback: () => dispatch('pushPopup', {
          comp: 'AddTagNote',
          payload: tag.id,
        })
      })
    opt.push(      {
      name: l['Delete tag'],
      icon: 'trash',
      important: true,
      callback: () => dispatch('tag/deleteTag', {id: el.id, tasks: this.$store.state.task.tasks})
    })
    return opt
  }
}