

export default {
  tagOptions: tag => ({dispatch, getters, tags, tasks, commit}) => {
    const l = getters['l']
    const showDelete = tags.filter(el => el.parent === tag.id).length === 0
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
          let level = tag.level
          if (level === undefined) level = 0
          if ((level + 1) >= 4) {
            commit('pushToast', {
              name: l['Reached maximum subtag depth.'],
              seconds: 3,
              type: 'error',
            })
          } else
            dispatch('pushPopup', {comp: 'AddTag', payload: {
              level: level + 1,
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
    if (showDelete)
      opt.push({
        name: l['Delete tag'],
        icon: 'trash',
        important: true,
        callback: () => dispatch('tag/deleteTag', {id: tag.id, tasks})
      })
    return opt
  }
}
