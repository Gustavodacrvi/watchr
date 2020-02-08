<template>
  <div class="addFolder popup cb shadow rb" :class="platform">
    <div class="tac title">
      <h3 v-if="group" class="pc">{{ group.name }}</h3>
    </div>
    <div class="content">
      <span v-if="isOwner" class="note">
        Type in the name of the person you want to share with. If it’s someone you’ve never shared a group with before, you’ll need to type in the email associated with their account. 
      </span>
      <DropInput v-if="isOwner" class="mar"
        placeholder='E-mail or username:'
        v-model="name"
        :options='options'
        @select="selectSharedUser"
        @enter='findEmail'
        @cancel='$emit("close")'
      />
      <InvitedUsers class="mar"
        :groupId='groupId'
      />
      <GroupMembers class='mar'
        :groupId='groupId'
      />
    </div>
  </div>
</template>

<script>

import { mapGetters, mapState } from 'vuex'

import DropInput from '@/components/Auth/DropInput.vue'
import InvitedUsers from "@/components/View/RenderComponents/InvitedUsers.vue"
import GroupMembers from "@/components/View/RenderComponents/GroupMembers.vue"

import firebase from 'firebase/app'
import 'firebase/firestore'

import utils from "@/utils"
import { inviteRef, serverTimestamp, uid, setInfo } from "@/utils/firestore"

export const db = firebase.firestore()

import mom from 'moment'

export default {
  components: {
    DropInput, InvitedUsers, GroupMembers,
  },
  data() {
    return {
      name: '',
      lastTryTime: null,
    }
  },
  methods: {
    toast(comp) {
      this.$store.commit('pushToast', comp)
    },
    alreadySentToast() {
      this.toast({
        name: 'Already sent invite to this user.',
        seconds: 3,
        type: 'error',
      })
    },
    selectSharedUser(str) {
      const split = str.split(' ')
      this.name = split[split.length - 1]
    },
    alreadySentFromThisGroup(email) {
      return this.sentInvites.some(i => i.targetProfile.email === email)
    },
    async findEmail() {
      if (this.lastTryTime !== null && (new Date() - this.lastTryTime <= 1500)) 
        return;
      this.lastTryTime = new Date()

      if (this.name) {
        
        let user = this.pastShared.find(el => el.email === this.name)
                    || this.pastShared.find(el => el.displayName === this.name)

        if (user) {
          if (user.email === this.inviteEmail || this.alreadySentFromThisGroup(user.email)) {
            this.alreadySentToast()
            return;
          }
          this.sendInvite(user)
        } else {
          if (this.name === this.inviteEmail || this.alreadySentFromThisGroup(this.name)) {
            this.alreadySentToast()
            return;
          }
          const res = await db.collection('users').where('email', '==', this.name).get()
          if (res.docs.length === 0) {
            this.toast({
              name: 'User e-mail not found.',
              seconds: 3,
              type: 'error',
            })
            return;
          }
          this.sendInvite(res.docs[0].data())
        }
      }
    },
    async sendInvite(user) {
      try {
        this.inviteEmail = user.email
        const b = db.batch()
  
        const ref = inviteRef(this.groupId)
  
        console.log({
          userId: this.user.uid,
          id: ref.id,
          createdFire: serverTimestamp(),
          created: mom().format('Y-M-D HH:mm ss'),
  
          groupName: this.group.name,
          groupId: this.group.id,
          ownerProfile: utils.getUserProfileData(this.user),
          targetProfile: utils.getUserProfileData(user),
          to: user.uid || user.userId,
          denied: null,
        })
        b.set(ref, {
          userId: this.user.uid,
          id: ref.id,
          createdFire: serverTimestamp(),
          created: mom().format('Y-M-D HH:mm ss'),
  
          groupName: this.group.name,
          groupId: this.group.id,
          ownerProfile: utils.getUserProfileData(this.user),
          targetProfile: user,
          to: user.uid || user.userId,
          denied: null,
        })
  
        setInfo(b, {
          pastShared: {
            [user.uid || user.userId]: utils.getUserProfileData(user)
          }
        })
  
        await b.commit()
        this.inviteEmail = null
        this.toast({
          name: `Sent invite to ${user.displayName}`,
          seconds: 4,
          type: 'success',
        })
      } catch (err) {
        this.inviteEmail = null
        this.toast({
          name: err.message,
          seconds: 4,
          type: 'error',
        })
      }
    }
  },
  computed: {
    ...mapGetters({
      platform: 'platform',

      getSentInvitesByGroupId: 'invites/getSentInvitesByGroupId',
    }),
    ...mapState({
      groupId: state => state.popup.payload,
      groups: state => state.group.groups,
      userInfo: state => state.userInfo,
      user: state => state.user,
    }),
    sentInvites() {
      return this.getSentInvitesByGroupId(this.groupId)
    },
    isOwner() {
      return this.group && this.user.uid === this.group.userId
    },
    group() {
      return this.groups.find(el => el.id === this.groupId)
    },
    pastShared() {
      if (!this.userInfo.pastShared)
        return []
      return Object.keys(this.userInfo.pastShared).map(k => this.userInfo.pastShared[k])
    },
    options() {
      return this.pastShared.filter(user => user.displayName.toLowerCase().includes(this.name.toLowerCase())).map(el => `${el.displayName} ${el.email}`)
    },
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>

<style scoped>

.note {
  opacity: .6;
}

.mar {
  margin-top: 12px;
}

</style>
