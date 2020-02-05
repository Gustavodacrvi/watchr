
<template>
  <transition
    appear
    @enter='enter'
    @leave='leave'
  >
    <div class="GroupUserProfile rb">
      <div class="wrapper">
        <ProfilePhoto :photoURL='photoURL' size='small'/>
        <div class="info">
          <span class="inf displayName">
            <span>{{displayName}}</span>
            <template v-if="denied !== undefined">
              <span v-if="denied" class="tag rejected">rejected</span>
              <span v-else class="tag pending">pending</span>
            </template>
          </span>
          <span class="inf email">
            <span>{{email}}</span>
            <span>Sent {{parsedCreated}}</span>
          </span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>

import ProfilePhoto from './ProfilePhoto.vue'

import utils from '@/utils'

export default {
  components: {
    ProfilePhoto,
  },
  props: ['displayName', 'email', 'uid', 'photoURL', 'created', 'denied'],
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

.GroupUserProfile:hover {
  background-color: var(--light-gray);
}

.wrapper {
  margin: 8px;
  display: flex;
  align-items: center;
  flex-basis: 100%;
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
  padding: 2px 6px;  
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

</style>
