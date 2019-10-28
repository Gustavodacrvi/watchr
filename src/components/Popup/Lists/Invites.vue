<template>
  <div class="AddNote popup cb shadow rb" :class="platform">
    <div class="title tac">
      <h2 class="pc">{{ l['List Invites'] }}</h2>
    </div>
    <div class="content">
      <transition-group
        @enter='enter'
        @leave='leave'
      >
        <ProfileInfo v-for="i in invites"
          v-bind="i.ownerData"
          :key="i.id"
          :listName='i.name'
          :options='[]'
        />
      </transition-group>
    </div>
  </div>
</template>

<script>

import DropInputVue from "@/components/Auth/DropInput.vue"
import ButtonVue from "@/components/Auth/Button.vue"
import ProfileInfoVue from '../../Profile/ProfileInfo.vue'

import { mapGetters, mapState } from 'vuex'

export default {
  components: {
    ProfileInfo: ProfileInfoVue,
  },
  data() {
    return {
      
    }
  },
  methods: {
    enter(el) {
      const s = el.style

      s.transitionDuration = '0s'
      s.height = 0
      s.opacity = 0
      setTimeout(() => {
        s.transitionDuration = '.2s'
        s.height = '40px'
        s.opacity = 1
      })
    },
    leave(el) {
      const s = el.style
      s.height = 0
      s.opacity = 0
    },
  },
  computed: {
    ...mapState({
      invites: state => state.list.invites,
    }),
    ...mapGetters(['platform', 'l']),
  },
}

</script>

<style scoped src="@/assets/css/popupAuth.css">
</style>
