<template>
  <div class="SigninOptions">
    <div class="card cursor rb google" @click="google">
      <span>{{ l['Sign in with google'] }}</span>
    </div>
    <div v-if="!isUpgrading" class="card cursor rb" @click="guest">
      <span>{{ l["Sign in as a guest"] }}</span>
    </div>
    <div class="tac">
      <h3>{{ l['OR'] }}</h3>
    </div>
  </div>
</template>

<script>

import { mapGetters, mapState } from 'vuex'

import firebase from 'firebase/app'

let provider

export default {
  props: ['isUpgrading'],
  created() {
    provider = new firebase.auth.GoogleAuthProvider()
    firebase.auth().languageCode = this.lang
  },
  methods: {
    google() {
      if (this.isUpgrading) this.$emit('google')
      if (!provider || this.isUpgrading) return;

      const toast = (t) => this.$store.commit('pushToast', t)
      const dispatch = this.$store.dispatch
      const commit = this.$store.commit

      firebase.auth().signInWithRedirect(provider).then(res => {
        const uid = res.user.uid

        toast({
          name: this.l['You have successfully logged in!'],
          seconds: 3,
          type: 'success',
        })
        dispatch('tag/addDefaultData', uid)
        dispatch('list/addDefaultData', uid)
        dispatch('filter/addDefaultData', uid)
        dispatch('user/addDefaultData', {
          user: res.user,
          username: res.user.displayName,
        })
        commit('closePopup')
        commit('toggleUser', true)
        this.$router.push('/user')
        window.location.reload()
        
      }).catch(err => toast('pushToast', {
        name: err.message,
        seconds: 3,
        type: 'error',
      }))
    },
    guest() {
      firebase.auth().signInAnonymously()
      .then(() => {
        this.$store.commit('pushToast', {
          name: this.l['You have successfully signed in as a guest.'],
          seconds: 3,
          type: 'success',
        })
      }).catch(err => this.$store.commit('pushToast', {
        name: err.message,
        seconds: 3,
        type: 'error',
      }))
      this.$router.push('/user')
      this.$store.commit('closePopup')
    },
  },
  computed: {
    ...mapState(['lang']),
    ...mapGetters(['platform', 'l'])
  },
}

</script>

<style scoped>

.card {
  border: 1px solid var(--light-gray);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  transition-duration: .2s;
}

.card:hover {
  background-color: var(--light-gray);
}

.card + .card {
  margin-top: 12px;
}

.google {
  color: var(--red);
  border: 1px solid var(--red);
}

.google:hover {
  background-color: var(--red);
  color: white;
}

</style>
