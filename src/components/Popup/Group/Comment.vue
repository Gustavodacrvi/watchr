<template>
  <div class="Comment" :class="{isOwner}">
    <div class="triangle"></div>
    <ProfilePhoto class="photo"
      :photoURL='ownerProfile.photoURL'
      size='small'
      :display='true'
    />
    <div class="wrapper">
      <div class="card">
        <div class="info">
          <b class="display-name">{{ ownerProfile.displayName }}</b>
          <span class="fade">{{createdStr}}</span>
        </div>
        <span v-html="parsedName"></span>
      </div>
    </div>
  </div>
</template>

<script>

import ProfilePhoto from '@/components/View/RenderComponents/ProfilePhoto.vue'

import utils from '@/utils'

import mom from 'moment'

import { mapState } from 'vuex'

export default {
  components: {
    ProfilePhoto,
  },
  props: ['name', 'userId', 'files', 'reactions', 'created', 'groupId'],
  computed: {
    ...mapState({
      uid: state => state.user.uid,
      groups: state => state.group.groups,

      userInfo: state => state.userInfo,
    }),
    createdStr() {
      return mom(this.created, 'Y-M-D HH:mm').format('D MMM HH:mm')
    },
    groupInfo() {
      return this.groups.find(el => el.id === this.groupId)
    },
    ownerProfile() {
      return this.groupInfo.profiles[this.groupInfo.userId]
    },
    isOwner() {
      return this.uid === this.userId
    },
    parsedName() {
      return utils.parseHTMLStr(this.name)
    },
  },
}

</script>

<style scoped>

.Comment {
  margin: 6px 70px;
  position: relative;
}

.card {
  background-color: var(--sidebar-color);
  padding: 22px;
  max-width: 400px;
  word-break: break-all;
  border-radius: 18px;
}

.isOwner .card {
  float: right;
}

.info {
  margin-bottom: 12px;
}

.fade {
  font-size: .9em;
  opacity: .6;
}

.isOwner .info {
  display: flex;
  flex-direction: row-reverse;
}

.display-name {
  opacity: 1;
  margin-left: 8px;
}

.photo {
  position: absolute;
  left: 0;
}

.triangle {
  position: absolute;
  left: 0;
  width: 0;
  height: 0;
}

.isOwner .triangle {
  left: unset;
  right: -14px;
  border-bottom: 50px solid transparent;
  border-left: 30px solid var(--sidebar-color);
}

.isOwner .photo {
  left: unset;
  right: -55px;
}

</style>
