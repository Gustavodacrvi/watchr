

export default {
  sortTasksByPriority(tasks) {
    const priority = (t1, t2) => {
      const priA = t1.priority
      const priB = t2.priority
      switch (priA) {
        case 'Low priority':
          switch (priB) {
            case 'Low priority': return 0
            case 'Medium priority': return 1
            case 'High priority': return 1
            default: return -1
          }
        case 'Medium priority':
          switch (priB) {
            case 'Medium priority': return 0
            case 'High priority': return 1
            case 'Low priority': return -1
            default: return -1
          }
        case 'High priority':
          switch (priB) {
            case 'High priority': return 0
            case 'Low priority': return -1
            case 'Medium priority': return -1
            default: return -1
          }
      }
      return 0
    }
    tasks.sort((a, b) => priority(a, b))
    return tasks
  },
  sortTasksByDate(tasks) {
    // TODO
  },
  filterTasksByView(tasks, view) {
    switch (view) {
      case 'Inbox': {
        return tasks
        // return tasks.filter(el => !el.calendar && !el.list && el.tags.length === 0)
      }
    }
    
    return tasks
  }
}
