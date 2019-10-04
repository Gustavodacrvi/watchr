<template>
  <div class="User">
    <transition appear name="state" mode="out-in">
      <UserView v-if="authState && !isLoading" key="app"/>
      <div key="notlogged" v-else-if="showMsg && !authState && fireBaseFirstLoaded" class="view">
        <span class='view'>{{ l['Please log in to continue.'] }}</span>
      </div>
      <div v-else key="loading" class="view">
        <LoadingComponent/>
      </div>
    </transition>
  </div>
</template>

<script>

import UserViewVue from '../components/View/UserView.vue'
import LoadingComponentVue from '../components/Illustrations/LoadingComponent.vue'

import { mapState, mapGetters } from 'vuex'

export default {
  components: {
    UserView: UserViewVue,
    LoadingComponent: LoadingComponentVue,
  },
  data() {
    return {
      showMsg: false,
    }
  },
  created() {
    setTimeout(() => {
      this.showMsg = true
    }, 1000)
  },
  computed: {
    ...mapGetters(['l']),
    ...mapState(['authState', 'isLoading', 'fireBaseFirstLoaded']),
  }  
}

</script>

<style scoped>

.User, .view {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  flex-direction: 1;
}

.view {
  align-items: center;
}

.state-enter, .state-leave-to {
  opacity: 0;
  transition-duration: .2s;
}

.state-leave, .state-enter-to {
  opacity: 1;
  transition-duration: .2s;
}

</style>
