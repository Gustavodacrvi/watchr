<template>
  <div class="User">
    <transition appear name="state" mode="out-in">
      <UserView v-if="authState && !isLoading && user.emailVerified" key="app"/>
      <div key="notlogged" v-else-if="!authState && firstFireLoad" class="view">
        <span class='view'>{{ l['Please log in to continue.'] }}</span>
      </div>
      <div v-else-if="user && (!user.emailVerified && !user.isAnonymous) && firstFireLoad" class="view" key="confirm">
        <span>{{ l["Please confirm your e-mail address."] }}</span>
      </div>
      <div v-else-if="error && firstFireLoad" class="view" key="error">
        <ErrorComp/>
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
import ErrorComponentVue from '../components/Illustrations/ErrorComponent.vue'

import { mapState, mapGetters } from 'vuex'

export default {
  components: {
    UserView: UserViewVue,
    LoadingComponent: LoadingComponentVue,
    ErrorComp: ErrorComponentVue,
  },
  data() {
    return {
      error: false,
    }
  },
  created() {
    this.resetErroState()
  },
  methods: {
    resetErroState() {
      this.error = false
      setTimeout(() => {
        this.error = true
      }, 10000)
    }
  },
  computed: {
    ...mapGetters(['l']),
    ...mapState(['authState', 'isLoading', 'user', 'firstFireLoad']),
  },
  watch: {
    authState() {
      this.resetErroState()
    },
    isLoading() {
      this.resetErroState()
    },
    user() {
      this.resetErroState()
    }
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
