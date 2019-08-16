
import { Label } from '@/interfaces/app'

import { State, Getters, LabelActions } from '@/interfaces/store/label'
import appUtils from '@/utils/app'

interface Actions {
  getData: LabelActions.StoreGetData
  addLabel: LabelActions.StoreAddLabel
  saveLabelPosition: LabelActions.StoreSaveLabelPosition
  deleteLabelsById: LabelActions.StoreDeleteLabelsById
  editLabelNameById: LabelActions.StoreEditLabelNameById
  saveLabelTaskOrder: LabelActions.StoreSaveLabelTaskOrder
  sortLabelsByName: LabelActions.StoreSortLabelsByName
  addLabelsOrder: LabelActions.StoreAddLabelsOrder
}

export default {
  namespaced: true,
  state: {
    labels: [],
    order: [],
  } as State,
  mutations: {

  },
  getters: {
    sortedLabelsByName(state) {
      const labs = state.labels.slice()
      labs.sort((a, b) => a.name.localeCompare(b.name))
      return labs
    },
    sortedLabels(state) {
      const order: string[] = appUtils.fixOrder(state.labels, state.order)
      return appUtils.sortArrayByIds(state.labels, order)
    },
    getLabelsByIds: state => ids => {
      return state.labels.filter(el => ids.includes(el.id))
    },
  } as Getters,
  actions: {
    saveLabelPosition({ rootState }, ids) {
      if (rootState.firestore && rootState.uid)
        rootState.firestore.collection('labelsOrder').doc(rootState.uid)
          .update({
            order: ids,
          })
    },
    sortLabelsByName({ state, dispatch }) {
      const labels: Label[] = state.labels.slice()
      labels.sort((a, b) => a.name.localeCompare(b.name))
      const ids: string[] = []
      for (const el of labels)
        ids.push(el.id)
      dispatch('saveLabelPosition', ids)
    },
    saveLabelTaskOrder({ rootState }, {id, order}) {
      if (rootState.firestore && rootState.uid)
        rootState.firestore.collection('labels').doc(id).update({
          order,
        })
    },
    getData({ rootState, state }) {
      if (rootState.firestore && rootState.uid) {
        rootState.firestore.collection('labelsOrder').doc(rootState.uid)
          .onSnapshot(snap => {
            const data = snap.data()
            if (data)
              state.order = data.order
          })
        rootState.firestore.collection('labels').where('userId', '==', rootState.uid)
          .onSnapshot(snap => {
          const changes = snap.docChanges()
          for (const change of changes)
            if (change.type === 'added') {
              const lab = state.labels.find(el => el.id === change.doc.id)
              if (!lab)
                state.labels.push({...change.doc.data(), id: change.doc.id} as any)
            } else if (change.type === 'removed') {
              const index = state.labels.findIndex(el => el.id === change.doc.id)
              state.labels.splice(index, 1)
            } else {
              const index = state.labels.findIndex(el => el.id === change.doc.id)
              state.labels.splice(index, 1, {...change.doc.data(), id: change.doc.id} as any)
            }
        })
      }
    },
    addLabel({ rootState }, name) {
      if (rootState.firestore && rootState.uid)
        rootState.firestore.collection('labels').add({
          name,
          userId: rootState.uid,
          order: [],
        })
    },
    deleteLabelsById({ rootState }, ids) {
      if (rootState.firestore && rootState.uid) {
        const batch = rootState.firestore.batch()

        for (const id of ids)
          batch.delete(rootState.firestore.collection('labels').doc(id))

        batch.commit()
      }
    },
    editLabelNameById({ rootState }, {id, name}) {
      if (rootState.firestore && rootState.uid)
        rootState.firestore.collection('labels').doc(id).update({
          name,
        })
    },
    addLabelsOrder({ rootState }, id) {
      if (rootState.firestore)
        return new Promise(resolve => {
          const fire = rootState.firestore as any
          const batch = fire.batch()

          let ref = fire.collection('labels').doc()
          const somedayId = ref.id
          batch.set(ref, {
            userId: id,
            name: 'Someday',
            order: [],
          })

          ref = fire.collection('labels').doc()
          const anytimeId = ref.id
          batch.set(ref, {
            userId: id,
            name: 'Anytime',
            order: [],
          })

          const orderRef = fire.collection('labelsOrder').doc(id)
          batch.set(orderRef, {
            userId: id,
            order: [anytimeId, somedayId],
          })

          batch.commit()
          resolve({somedayId, anytimeId})
        })
    },
  } as Actions,
}
