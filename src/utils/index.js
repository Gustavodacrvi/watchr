

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
  checkMissingIdsAndSortArr(order, arr) {
    const items = []
    for (const id of order) {
      const item = arr.find(el => el.id === id)
      if (item) items.push(item)
    }
    for (const item of arr) {
      if (!order.includes(item.id))
        items.push(item)
    }
    const ids = new Set()
    const ordered = []
    for (const item of items) {
      if (!ids.has(item.id)) {
        ids.add(item.id)
        ordered.push(item)
      }
    }
    return ordered
  }
}
