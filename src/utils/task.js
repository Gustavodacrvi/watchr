

export default {
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
