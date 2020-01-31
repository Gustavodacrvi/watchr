
export default {
  getFolderOptions: (folder, toggle, onToggle) => ({dispatch, getters, lists, tasks}) => {
    // toggle is a boolean
    const obj = [
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
        name: 'Add files',
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
        name: 'Delete folder',
        icon: 'trash',
        important: true,
        callback: () => dispatch('folder/deleteFolderById', {
          id: folder.id,
          lists, tasks,
        })
      },
    ]
    if (toggle !== undefined)
      obj.unshift({
        name: 'Toggle folder',
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
