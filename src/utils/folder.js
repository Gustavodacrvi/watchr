
export default {
  getFolderOptions(folder, l, store, toggle, onToggle) {
    // toggle is a boolean
    const dispatch = store.dispatch
    const obj = [
      {
        name: l['Edit folder'],
        icon: 'pen',
        callback: () => dispatch('pushPopup', {
          comp: "AddFolder",
          payload: {
            name: folder.name,
            id: folder.id,
            editing: true,
          },
        }),
      },
      {
        name: l["Toggle favorite"],
        icon: 'heart',
        callback: () => {
          dispatch('folder/saveFolder', {
            id: folder.id, favorite: !folder.favorite,
          })
        }
      },
      {
        name: l['Add files'],
        icon: 'file',
        callback: () => ({
          comp: 'Files',
          content: {
            storageFolder: 'folders',
            id: folder.id,
            savedFiles: folder.files ? folder.files : [],
            callback: files => {
              dispatch('folder/saveFolder', {
                id: folder.id, files,
              })
            }
          },
        }),
      },
      {
        name: l['Delete folder'],
        icon: 'trash',
        important: true,
        callback: () => dispatch('folder/deleteFolderById', {
          id: folder.id,
          lists: store.state.list.lists,
          tasks: store.state.task.tasks,
        })
      },
    ]
    if (toggle !== undefined)
      obj.unshift({
        name: l['Toggle folder'],
        icon: 'folder',
        callback: () => {
          if (onToggle) onToggle()
          dispatch('folder/saveFolder', {
            id: folder.id,
            defaultShowing: !toggle,
          })
        }
      })

    return obj
  }
}
