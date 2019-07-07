
import { SmartPerspective } from '@/interfaces/app'

import { States as RootState } from '@/store/index'

interface States {
  smartPerspectives: SmartPerspective[]
  smartOrder: string[]
  customOrder: string[]
}


interface Getters {
  sortedSmartPerspectives: (state: States) => void
}

interface Mutations {

}

interface ActionContext {
  state: States
  getters: Getters
  commit: (mutation: string, payload?: any) => void
  dispatch: (action: string, payload?: any) => void
  rootState: RootState
}

interface Actions {
  getData: (context: ActionContext) => void
  addDefaultSmartPerspectives: (context: ActionContext) => void
  [key: string]: (context: ActionContext, payload: any) => any
}

export default {
  namespaced: true,
  state: {
    smartPerspectives: [],
    smartOrder: [],
    customOrder: [],
  } as States,
  mutations: {

  } as Mutations,
  getters: {
    sortedSmartPerspectives(state: States): SmartPerspective[] {
      const sorted: SmartPerspective[] = []
      for (const id of state.smartOrder) {
        const lab: SmartPerspective | undefined = state.smartPerspectives.find(el => el.id === id)
        if (lab)
          sorted.push(lab)
      }
      return sorted
    },
  } as Getters,
  actions: {
    getData({ rootState, state, dispatch }) {
      if (rootState.firestore && rootState.uid) {
        const ordersRef = rootState.firestore.collection('perspectivesOrder').where('userId', '==', rootState.uid)
        ordersRef.get().then(snap => {
          const changes = snap.docChanges()
          for (const change of changes) {
            state.smartOrder = change.doc.data().smartOrder
            state.customOrder = change.doc.data().customOrder
          }
          if (state.smartOrder.length === 0 && rootState.firestore) {
            dispatch('addDefaultSmartPerspectives')
            const ordersRef = rootState.firestore.collection('perspectivesOrder').where('userId', '==', rootState.uid)
            ordersRef.get().then(snap => {
              const changes = snap.docChanges()
              for (const change of changes) {
                state.smartOrder = change.doc.data().smartOrder
                state.customOrder = change.doc.data().customOrder
              }
            })
          }
        })
        rootState.firestore.collection('smartPerspectives').where('userId', '==', rootState.uid).onSnapshot(snap => {
          const changes = snap.docChanges()
          for (const change of changes)
            if (change.type === 'added') {
              const lab = state.smartPerspectives.find(el => el.id === change.doc.id)
              if (!lab)
                state.smartPerspectives.push({...change.doc.data(), id: change.doc.id} as any)
            } else if (change.type === 'removed') {
              const index = state.smartPerspectives.findIndex(el => el.id === change.doc.id)
              state.smartPerspectives.splice(index, 1)
            } else {
              const index = state.smartPerspectives.findIndex(el => el.id === change.doc.id)
              state.smartPerspectives.splice(index, 1, {...change.doc.data(), id: change.doc.id} as any)
            }
        })
      }
    },
    addDefaultSmartPerspectives({ rootState }) {
      if (rootState.firestore && rootState.uid) {
        const batch = rootState.firestore.batch()

        const perspectives: any[] = [
          {
            name: 'Today',
            pin: true,
            numberOfTasks: true,
            icon: 'calendar-day',
            iconColor: '#FFE366',
          },
          {
            name: 'Inbox',
            pin: true,
            numberOfTasks: true,
            icon: 'inbox',
            iconColor: '#83B7E2',
          },
          {
            name: 'Upcoming',
            pin: true,
            numberOfTasks: false,
            icon: 'calendar-alt',
            iconColor: '#FF6B66',
          },
          {
            name: 'Anytime',
            pin: true,
            numberOfTasks: false,
            icon: 'layer-group',
            iconColor: '#88DDB7',
          },
          {
            name: 'Someday',
            pin: true,
            numberOfTasks: false,
            icon: 'archive',
            iconColor: '#E2B983',
          },
        ]

        const ids: string[] = []
        for (const per of perspectives) {
          const ref = rootState.firestore.collection('smartPerspectives').doc()
          ids.push(ref.id)
          batch.set(ref, {
            userId: rootState.uid,
            name: per.name,
            numberOfTasks: per.numberOfTasks,
            pin: per.pin,
            icon: per.icon,
            iconColor: per.iconColor,
          } as SmartPerspective)
        }
        const ref = rootState.firestore.collection('perspectivesOrder').doc(rootState.uid)
        batch.set(ref, {
          userId: rootState.uid,
          smartOrder: ids,
          customOrder: [],
        })
        console.log('add default perspectives')

        batch.commit()
      }
    },
  } as Actions,
}
