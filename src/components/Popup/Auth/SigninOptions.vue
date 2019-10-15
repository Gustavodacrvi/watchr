<template>
  <div class="SigninOptions">
    <div class="card cursor rb" @click="google">
      <img src="https://d3ptyyxy2at9ui.cloudfront.net/google-41de20.svg" alt="goggle">
      <span class="name">{{ l['Sign in with google'] }}</span>
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
  created() {
    provider = new firebase.auth.GoogleAuthProvider()
    firebase.auth().languageCode = this.lang
  },
  methods: {
    google() {
      if (!provider) return;

      const toast = (t) => this.$store.commit('pushToast', t)
      const dispatch = this.$store.dispatch
      const commit = this.$store.commit

      firebase.auth().signInWithPopup(provider).then(res => {
        const uid = res.user.uid

        toast({
          name: this.l['You have successfully logged in!'],
          seconds: 3,
          type: 'success',
        })
        dispatch('tag/addDefaultData', uid)
        dispatch('list/addDefaultData', uid)
        dispatch('filter/addDefaultData', uid)
        commit('closePopup')
        commit('toggleUser', true)
        this.$router.push('/user')
        window.location.reload()
        
      }).catch(err => toast('pushToast', {
        name: err.message,
        seconds: 3,
        type: 'error',
      }))
    }
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
  height: 50px;
  transition: background-color .2s;
}

.card:hover {
  background-color: var(--light-gray);
}

.card + .card {
  margin-top: 30px;
}

.name {
  margin-left: 8px;
}

</style>
