<template>
  <div
    class="CommentCounter"
    :class="{number}"
  >
    <div
      class="wrapper"
      :class="{show}"
    >
      <Icon v-if="isOwner"
        class="plus icon"
        icon='plus'
        width='18px'
        @click.native.stop="$emit('assign')"
      />
      <Icon
        class="icon"
        icon='comment'
        width='18px'
        @click.native.stop="$emit('comment')"
      />
      <transition name="num-t">
        <span v-if="number" class="num">{{number}}</span>
      </transition>
    </div>
    <div v-if="!show && assigned" class="icon-wrapper">
      <AssigneeProfilePhoto
        :assigned='assigned'
        :owner='group.userId'
        :userPhoto='userPhoto'
      />
    </div>
  </div>
</template>

<script>

import AssigneeProfilePhoto from "./AssigneeProfilePhoto.vue"

import { mapState } from 'vuex'

export default {
  props: ['number', 'isOwner', 'hover', 'assigned', 'groupId'],
  components: {
    AssigneeProfilePhoto,
  },
  computed: {
    ...mapState({
      uid: state => state.user.uid,

      groups: state => state.group.groups,
    }),
    group() {
      return this.groups.find(el => el.id === this.groupId)
    },
    profileUsers() {
      return this.group.profiles
    },
    userPhoto() {
      return this.profileUsers[this.assigned].photoURL
    },
    show() {
      return this.hover || this.number
    },
  },
}

</script>

<style scoped>

.CommentCounter {
  position: absolute;
  right: calc(100% + 4px);
  height: 100%;
  display: flex;
  color: var(--fade);
  align-items: center;
  transition: .2s right, .2s color, .2s transform;
  transform: scale(1,1);
}

.number {
  right: calc(100% + 16px);
  color: var(--txt) !important;
}

.icon {
  transition: .2s right, .2s color, .2s transform;
}

.icon:hover {
  transform: scale(1.1,1.1);
  cursor: pointer;
  color: var(--txt) !important;
}

.wrapper {
  position: relative;
  top: 4px;
  opacity: 0;
  transform: translateY(5px);
  transition-duration: .2s;
}

.photo {
  transform: translateY(2.5px);
  opacity: .6;
}

.plus {
  position: absolute;
  right: 22px;
  top: -1px;
}

.num {
  position: absolute;
  left: 100%;
  bottom: 0;
}

.show {
  opacity: 1;
  transform: translateY(0px);
  transition-duration: .2s;
}

.icon-wrapper {
  position: absolute;
  right: 0;
  transform: translateY(1.5px);
}

</style>
