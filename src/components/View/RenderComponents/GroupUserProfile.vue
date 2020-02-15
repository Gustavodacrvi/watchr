
<template>
  <transition
    appear
    @enter='enter'
    @leave='leave'
  >
    <div class="GroupUserProfile rb" :class="platform">
      <div class="wrapper">
        <ProfilePhoto class="photo"
          :photoURL='photoURL'
          :stopAuthFallback='true'
          size='small'
        />
        <div class="info">
          <span class="inf displayName">
            <span>
              <Icon v-if="isOwner"
                icon='crown'
                color='yellow'
              />
              {{displayName}}
            </span>
            <template v-if="denied !== undefined">
              <span v-if="denied" class="tag rejected">rejected</span>
              <span v-else-if="!member" class="tag pending">pending</span>
            </template>
          </span>
          <span class="inf email">
            <span>{{email}}</span>
            <span>
              <span v-show="groupName">{{groupName}}, </span>
              <span v-show="created">Sent {{parsedCreated}}</span>
            </span>
          </span>
        </div>
        <div v-if="denied !== undefined" class="options fade">
          <Icon v-if="allowRemove || allowRemove === undefined" class="icon cursor remove-highlight primary-hover"
            icon='trash'
            color='var(--red)'
            width='26px'
            @click="$emit('delete')"
          />
        </div>
        <span v-else class="options">
          <span class="btn pending" @click="$emit('accept')">Accept</span>
          <span class="btn rejected" @click="$emit('delete')">Reject</span>
        </span>
      </div>
    </div>
  </transition>
</template>

<script>

import ProfilePhoto from './ProfilePhoto.vue'

import utils from '@/utils'
import { mapGetters } from 'vuex'

export default {
  components: {
    ProfilePhoto,
  },
  props: ['displayName', 'email', 'uid', 'photoURL', 'created', 'denied', 'groupName', 'member', 'allowRemove', 'isOwner'],
  methods: {
    enter(el, done) {

      const s = el.style

      s.transitionDuration = 0
      s.height = 0
      s.opacity = 0

      requestAnimationFrame(() => {
        s.transitionDuration = '.2s'

        s.height = '48px'
        s.opacity = 1

        setTimeout(done, 205)
      })

    },
    leave(el, done) {

      const s = el.style

      s.transitionDuration = '.2s'
      s.height = 0
      s.opacity = 0

      setTimeout(done, 205)

    },
  },
  computed: {
    ...mapGetters(['platform']),
    parsedCreated() {
      if (!this.created)
        return null
      return utils.getHumanReadableDate(this.created)
    }
  },
}

</script>

<style scoped>

.GroupUserProfile {
  display: flex;
  height: 48px;
  transition-duration: .2s;
  align-items: center;
  overflow: hidden;
}

.options {
  display: flex;
  transition-duration: .15s;
}

.fade {
  opacity: 0;
  margin-left: 12px;
}

.mobile .fade {
  opacity: 1 !important;
}

.GroupUserProfile:hover {
  background-color: var(--light-gray);
}

.GroupUserProfile:hover .options {
  opacity: 1;
}

.wrapper {
  margin: 8px;
  display: flex;
  align-items: center;
  flex-basis: 100%;
}

.icon {
  transform: translate(0px, 2px);
}

.photo {
  flex-shrink: 0;
}

.info {
  display: flex;
  flex-direction: column;
  padding-left: 8px;
  flex-basis: 100%;
}

.inf {
  flex-basis: 100%;
}

.displayName {
  font-size: 1.1em;
}

.email {
  display: flex;
  justify-content: space-between;
  font-size: .8em;
  opacity: .6;
}

.tag {
  display: inline-block;
  font-size: .8em;
  padding: 2px 5px;  
  border-radius: 50px;
  margin-left: 8px;
}

.pending {
  border: 1px solid var(--green);
  color: var(--green);
}

.rejected {
  border: 1px solid var(--red);
  color: var(--red);
}

.btn {
  display: inline-block;
  padding: 6px;
  margin-left: 4px;
  border-radius: 8px;
  transition-duration: .2s;
  cursor: pointer;
}

.btn:hover {
  background-color: var(--extra-light-gray);
}

</style>
