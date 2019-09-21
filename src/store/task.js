
export default {
  namespaced: true,
  getters: {
    priorityOptions() {
      return [
        {
          name: 'No priority',
          icon: 'priority',
          iconColor: 'var(--gray)',
        },
        {
          name: 'Low priority',
          icon: 'priority',
          iconColor: 'var(--blue)',
        },
        {
          name: 'Medium priority',
          icon: 'priority',
          iconColor: 'var(--yellow)',
        },
        {
          name: 'High priority',
          icon: 'priority',
          iconColor: 'var(--red)',
        }
      ]
    },
  },
}
