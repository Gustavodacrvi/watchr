
import MemoizeGetters from './memoFunctionGetters'

export default {
  namespaced: true,
  state: {
    fromMe: [],
    toMe: [],
  },
  getters: {
    sortedToMeInvites(state, d, c, rootGetters) {
      return rootGetters.checkMissingIdsAndSortArr([], state.toMe)
    },
    sortedFromMeInvites(state, d, c, rootGetters) {
      return rootGetters.checkMissingIdsAndSortArr([], state.fromMe)
    },
    ...MemoizeGetters('fromMe', {
      getSentInvitesByGroupId: {
        getter({getters}, groupId) {
          return getters.sortedFromMeInvites.filter(i => i.groupId === groupId)
        },
        cache(args) {
          return JSON.stringify(args[0])
        },
      }
    }),
  },
}
