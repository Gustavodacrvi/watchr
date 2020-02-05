
import { fire } from './index'

import { deleteInvite, rejectInvite } from "@/utils/firestore"

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
  actions: {
    deleteInvite(c, {groupId, inviteId}) {
      const b = fire.batch()

      deleteInvite(b, groupId, inviteId)

      b.commit()
    },
    rejectInvite(c, {groupId, id}) {
      const b = fire.batch()

      rejectInvite(b, groupId, id)

      b.commit()
    }
  },
}
