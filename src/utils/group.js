

export default {
  getGroupOptions: item => ({tasks, getters, state, dispatch, router}) => {
    const opt = []

    const isOwner = item.userId === state.user.uid
    opt.push({
      name: isOwner ? 'Manage users' : 'Group members',
      icon: isOwner ? 'paper-plane' : 'group',
      callback: () => dispatch('pushPopup', {
        comp: 'InvitePeople',
        payload: item.id,
      })
    })
    if (isOwner) {
      opt.push({
        name: "Delete group",
        icon: 'trash',
        important: true,
        callback: () => dispatch('group/delete', item.id)
      })
      opt.unshift({
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
      })
    }
    
    return opt
  }
}
