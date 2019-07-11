
import { Perspective } from '@/interfaces/app'

import { States as RootState } from '@/store/index'
import appUtils from '@/utils/app'

interface States {
  smartPerspectives: Perspective[]
  customPerspectives: Perspective[]
  smartOrder: string[]
  customOrder: string[]
}


interface Getters {
  sortedSmartPerspectives: (state: States) => void
  pinedSmartPerspectives: (state: States, getters: Getters) => void
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
  addDefaultSmartPerspectives: (context: ActionContext, id: string) => void
  saveSmartOrder: (context: ActionContext, ids: string[]) => void
  togglePerspectivesPin: (context: ActionContext, arr: Array<{id: string, pin: boolean}>) => void
  saveTaskOrder: (context: ActionContext, obj: {id: string, order: string[], collection: string}) => void
  [key: string]: (context: ActionContext, payload: any) => any
}

export default {
  namespaced: true,
  state: {
    smartPerspectives: [],
    smartOrder: [],
    customOrder: [],
    customPerspectives: [],
  } as States,
  mutations: {

  } as Mutations,
  getters: {
    sortedSmartPerspectives(state: States): Perspective[] {
      return appUtils.sortArrayByIds(state.smartPerspectives, state.smartOrder)
    },
    pinedSmartPerspectives(state: States, getters: Getters): Perspective[] {
      const pers: Perspective[] = getters.sortedSmartPerspectives as any
      return pers.filter(el => el.pin)
    },
  } as Getters,
  actions: {
    saveSmartOrder({ rootState, state }, ids) {
      if (rootState.firestore && rootState.uid)
      rootState.firestore.collection('perspectivesOrder').doc(rootState.uid)
        .update({
          smartOrder: ids,
        })
    },
    togglePerspectivesPin({ rootState, state }, pins) {
      if (rootState.firestore && rootState.uid) {
        const batch = rootState.firestore.batch()

        for (const pin of pins) {
          let collection: 'smartPerspectives' | 'customPerspectives' = 'smartPerspectives'
          let per: any = state.smartPerspectives.find(el => el.id === pin.id)
          let finalPin: boolean = false
          if (!per) {
            collection = 'customPerspectives'
            per = state.customPerspectives.find(el => el.id === pin.id)
          }
          finalPin = !per.pin
          if (pin.pin)
            finalPin = pin.pin
          const ref = rootState.firestore.collection(collection).doc(pin.id)
          batch.update(ref, {
            pin: finalPin,
          })
        }

        batch.commit()
      }
    },
    saveTaskOrder({ rootState, state }, {id, order, collection}) {
      if (rootState.firestore && rootState.uid)
        rootState.firestore.collection(collection).doc(id).update({
          order,
        })
    },
    getData({ rootState, state, dispatch }) {
      if (rootState.firestore && rootState.uid) {
        rootState.firestore.collection('perspectivesOrder').where('userId', '==', rootState.uid).onSnapshot(snapS => {
          const changs = snapS.docChanges()
          for (const change of changs) {
            state.smartOrder = change.doc.data().smartOrder
            state.customOrder = change.doc.data().customOrder
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
    addDefaultSmartPerspectives({ rootState }, id) {
      if (rootState.firestore) {
        const batch = rootState.firestore.batch()

        const perspectives: any[] = [
          {
            name: 'Today',
            pin: true,
            numberOfTasks: true,
            isSmart: true,
            icon: 'star',
            iconColor: '#FFE366',
          },
          {
            name: 'Inbox',
            pin: true,
            numberOfTasks: true,
            icon: 'inbox',
            isSmart: true,
            iconColor: '#83B7E2',
            description: `All of your inbox tasks will be shown here.`,
          },
          {
            name: 'Upcoming',
            pin: true,
            numberOfTasks: false,
            isSmart: false,
            icon: 'calendar-alt',
            iconColor: '#FF6B66',
          },
        ]

        const ids: string[] = []
        for (const per of perspectives) {
          const ref = rootState.firestore.collection('smartPerspectives').doc()
          ids.push(ref.id)
          const obj: any = {
            userId: id,
            name: per.name,
            numberOfTasks: per.numberOfTasks,
            pin: per.pin,
            icon: per.icon,
            iconColor: per.iconColor,
            description: '',
            order: [],
            isSmart: per.isSmart,
            priority: '',
            excludeSmartLabels: [],
            includeSmartLabels: [],
            excludeCustomLabels: [],
            includeCustomLabels: [],
          }
          if (per.description)
            obj.description = per.description
          batch.set(ref, obj)
        }
        const orderRef = rootState.firestore.collection('perspectivesOrder').doc(id)
        batch.set(orderRef, {
          userId: id,
          smartOrder: ids,
          customOrder: [],
        })

        batch.commit()
      }
    },
  } as Actions,
}
