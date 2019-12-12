

export default {
  tagOptions: tag => ({dispatch, getters, tasks}) => {
    const l = getters['l']
    const opt = [
      {
        name: l['Edit tag'],
        icon: 'pen',
        callback: () => dispatch('pushPopup', {
            comp: 'AddTag', payload: {...tag, editing: true}
          })
      },
      {
        name: l["Toggle favorite"],
        icon: 'heart',
        callback: () => {
          dispatch('tag/saveTag', {
            id: tag.id, favorite: !tag.favorite,
          })
        }
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
      callback: () => dispatch('tag/deleteTag', {id: tag.id, tasks})
    })
    return opt
  }
}
