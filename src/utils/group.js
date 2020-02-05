

export default {
  getFolderOptions: item => ({tasks, getters, state, dispatch, router}) => {
    const opt = [
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

    const isOwner = item.userId === state.user.uid
    opt.splice(1, 0,       {
      name: isOwner ? 'Manage users' : 'Group members',
      icon: isOwner ? 'paper-plane' : 'group',
      callback: () => dispatch('pushPopup', {
        comp: 'InvitePeople',
        payload: item,
      })
    })
    
    return opt
  }
}
