
import { fire, auth } from './index'
import utils from '../utils'

const uid = () => auth.currentUser.uid

export default {
  namespaced: true,
  state: {
    tasks: [],
  },
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
          iconColor: 'var(--primary)',
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
  actions: {
    getData({state}) {
      return Promise.all([
        new Promise(resolve => {
          fire.collection('tasks').where('userId', '==', uid()).onSnapshot(snap => {
            utils.getDataFromFirestoreSnapshot(state, snap.docChanges(), 'tasks')
            resolve()
          })
        })
      ])
    },
    addTask(c, obj) {
      const batch = fire.batch()

      const ref = fire.collection('tasks').doc()
      batch.set(ref, {
        userId: uid(),
        ...obj,
      })

      if (obj.listId) {
        const listRef = fire.collection('lists').doc(obj.listId)
        batch.update(ref, {
          tasks: fire.FieldValue.arrayUnion(obj.id),
        })
      }

      batch.commit()
    },
  },
}
