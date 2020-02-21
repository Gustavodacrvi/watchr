
export default {
  getFolderOptions: (folder) => ({dispatch, getters, lists, tasks}) => {
    return [
      {
        name: 'Edit folder',
        icon: 'pen',
        callback: () => dispatch('pushPopup', {
          comp: "AddFolder",
          payload: {
            name: folder.name,
            id: folder.id,
            editing: true,
          },
          naked: true
        }),
      },
      {
        name: "Toggle favorite",
        icon: 'heart',
        callback: () => {
          dispatch('folder/saveFolder', {
            id: folder.id, favorite: !folder.favorite,
          })
        }
      },
      {
        name: 'Delete folder',
        icon: 'trash',
        important: true,
        callback: () => dispatch('folder/deleteFolderById', {
          id: folder.id,
          lists: getters['list/allLists'], tasks: getters['task/allTasks'],
        })
      },
    ]
  }
}
