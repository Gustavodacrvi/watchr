

export default {
  tagOptions: (tag, level) => ({dispatch, getters, tasks}) => {
    const l = getters['l']
    const opt = [
      {
        name: l['Edit tag'],
        icon: 'pen',
        callback: () => dispatch('pushPopup', {
            comp: 'AddTag', payload: {...tag, editing: true}, naked: true
          })
      },
      {
        name: l['Add subtag'],
        icon: 'arrow',
        callback: () => {
          dispatch('pushPopup', {comp: 'AddTag', payload: {
            level,
            parent: tag.id,
          }, naked: true})
        },
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
          naked: true
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
