
import { fire, auth } from './index'
import utils from '../utils'
import MemoizeGetters from './memoFunctionGetters'
import { filterColl, filterRef, setInfo, fd, taskRef, serverTimestamp, addTask } from '../utils/firestore'
import mom from 'moment'

const uid = () => {
  return auth.currentUser.uid
}

export default {
  namespaced: true,
  state: {
    filters: [],
  },
  getters: {
    sortedFilters(state, asd, {userInfo}, rootGetters) {
      const {filters} = state
      if (userInfo && userInfo.filters)
        return rootGetters.checkMissingIdsAndSortArr(userInfo.filters, filters)
      return []
    },
    sortedFiltersByName(s, getters) {
      const filters = getters.sortedFilters
      filters.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      return filters
    },
    ...MemoizeGetters('filters', {
      getFiltersByName({state}, names) {
        const arr = []
        for (const n of names) {
          const filter = state.filters.find(el => el.name === n)
          if (filter) arr.push(filter)
        }
        return arr
      },
      getFiltersById({state}, ids) {
        const arr = []
        for (const id of ids) {
          const filter = state.filters.find(el => el.id === id)
          if (filter) arr.push(filter)
        }
        return arr
      },
    }),
    getFavoriteFilters(state) {
      return state.filters.filter(el => el.favorite).map(f => ({...f, icon: 'filter', color: 'var(--red)'}))
    },
  },
  actions: {
    addFilter(c, {name, index, ids}) {
      const obj = {
        createdFire: serverTimestamp(),
        created: mom().format('Y-M-D HH:mm ss'),
        name,
        userId: uid(),
      }
      if (!index)
        filterColl().add(obj)
      else {
        const batch = fire.batch()
  
        const ord = ids.slice()
        const ref = filterRef()
        batch.set(ref, obj)
        ord.splice(index, 0, ref.id)
        setInfo(batch, {
          filters: ord,
        })
  
        batch.commit()
      }
    },
    addTaskByIndex({rootState}, {ids, index, task, filterId, newTaskRef}) {
      const batch = fire.batch()
      setTask(batch, {
        createdFire: serverTimestamp(),
        created: mom().format('Y-M-D HH:mm ss'),
        userId: uid(),
        ...task,
      }, rootState, newTaskRef.id).then(() => {
        ids.splice(index, 0, newTaskRef.id)
  
        batch.update(filterRef(filterId), {tasks: ids})
  
        batch.commit()
      })
    },
    deleteFilter(c, {id, tasks}) {
      const batch = fire.batch()
      const ts = tasks.filter(t => t.filters.includes(id))
      
      for (const t of ts) {
        const ref = taskRef(t.id)
        batch.update(ref, {
          filters: fd().arrayRemove(id)
        })
      }

      const ref = filterRef(id)
      batch.delete(ref)
      
      batch.commit()
    },
    updateOrder(c, ids) {
      const b = fire.batch()

      setInfo(b, {
        filters: ids,
      })

      b.commit()
    },
    sortFiltersByName({state, dispatch}) {
      const filters = state.filters.slice()
      filters.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      dispatch('updateOrder', filters.map(el => el.id))
    },
    saveFilter(c, filter) {
      filterRef(filter.id).update({
        ...filter
      })
    },
    deleteAllData({state}) {
      for (const el of state.filters)
        fire.collection('filters').doc(el.id).delete()
      fire.collection('filtersOrder').doc(uid()).delete()
    },
  },
}

