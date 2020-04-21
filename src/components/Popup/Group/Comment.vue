<template>
  <div class="Comment" :class="{isOwner}">
    <div class="triangle"></div>
    <ProfilePhoto v-if="!isOwner"
      class="photo"
      size='small'
      :photoURL='ownerProfile.photoURL'
      :display='true'
    />
    <div class="wrapper">
      <div class="card">
        <div class="info">
          <b class="display-name">{{ ownerProfile.displayName }}</b>
          <span class="fade mar">{{createdStr}}</span>
          <Icon v-if='isOwner'
            class="info-icon mar cursor remove-highlight primary-hover"
            icon='trash'
            color='var(--red)'
            @click.native='$emit("delete")'
          />
        </div>
        <span class="name" v-html="parsedName"></span>
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
      return this.groupInfo.profiles[this.userId]
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

.info-icon {
  opacity: 0;
  transition: opacity .15s;
}

.Comment {
  margin: 6px 45px;
  margin-right: 30px;
  position: relative;
}

.name {
  margin-left: 4px;
}

.card:hover .info-icon {
  opacity: 1;
}

.card {
  background-color: var(--sidebar-color);
  padding: 12px;
  max-width: 400px;
  word-break: break-all;
  border-radius: 12px;
  float: left;
}

.isOwner .card {
  float: right;
}

.info {
  margin-bottom: 8px;
  margin-left: 4px;
  margin-right: 4px;
}

.fade {
  font-size: .9em;
  opacity: .6;
  transform: translateY(1px);
}

.isOwner .info {
  display: flex;
  flex-direction: row-reverse;
}

.display-name {
  opacity: 1;
}

.photo {
  position: absolute;
  left: -42px;
}

.triangle {
  position: absolute;
  left: -14px;
  width: 0;
  height: 0;
  border-bottom: 50px solid transparent;
  border-right: 30px solid var(--sidebar-color);
}

.mar {
  margin: 0 10px;
}

.isOwner .mar + .mar {
  margin-right: 0px;
}

.isOwner .triangle {
  left: unset;
  right: -14px;
  border-right: unset;
  border-left: 30px solid var(--sidebar-color);
}

.isOwner .photo {
  left: unset;
  right: -55px;
}

</style>
