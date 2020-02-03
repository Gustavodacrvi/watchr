

export default {
  getFolderOptions: item => ({tasks, getters, dispatch, router}) => {
    return [
      {
        name: "Edit group name",
        icon: 'pen',
        callback: () => {dispatch('pushPopup', {
          comp: "AddGroup",
          payload: {
            name: item.name,
            id: item.id,
            editing: true,
          },
          naked: true
        })}
      },
      {
        name: "Delete group",
        icon: 'trash',
        important: true,
        callback: () => dispatch('group/delete', item.id)
      },
    ]
  }
}
