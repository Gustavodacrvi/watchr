

export default {
  getDataFromFirestoreSnapshot(state, changes, arrName) {
    for (const change of changes)
      if (change.type === 'added') {
        const el = state[arrName].find(el => el.id === change.doc.id)
        if (!el)
          state[arrName].push({...change.doc.data(), id: change.doc.id})
      } else if (change.type === 'removed') {
        const index = state[arrName].findIndex(el => el.id === change.doc.id)
        state[arrName].splice(index, 1)
      } else {
        const index = state[arrName].findIndex(el => el.id === change.doc.id)
        state[arrName].splice(index, 1, {...change.doc.data(), id: change.doc.id})
      }
  },
}
