<template>
  <div class="User">
    <transition appear name="state" mode="out-in">
      <UserView v-if="authState && !isLoading" key="app"/>
      <div v-else-if="authState && isLoading" class="view">
        <LoadingComponent/>
      </div>
      <div v-else class="view">
        <span class='view' key="notlogged">{{ l['Please log in to continue.'] }}</span>
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
  computed: {
    ...mapGetters(['l']),
    ...mapState(['authState', 'isLoading']),
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
