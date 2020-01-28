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

import firebase, { firestore } from 'firebase/app'

let provider

export default {
  props: ['isUpgrading'],
  created() {
    provider = new firebase.auth.GoogleAuthProvider()
    firebase.auth().languageCode = this.lang
  },
  methods: {
    async google() {
      if (this.isUpgrading) this.$emit('google')
      if (!provider || this.isUpgrading) return;
      const toast = (t) => this.$store.commit('pushToast', t)

      const authInstance = gapi.auth2.getAuthInstance()
      const googleUser = await authInstance.signIn()

      const token = googleUser.getAuthResponse().id_token

      const credential = provider.credential(token)

      firebase.auth().signInAndRetrieveDataWithCredential(credential).then(res => {
        const user = res.user
        const toast = (t) => this.$store.commit('pushToast', t)
        const dispatch = this.$store.dispatch
        toast({
          name: this.l['You have successfully logged in!'],
          seconds: 3,
          type: 'success',
        })
        dispatch('createUser', user).then(() => {
          this.$router.push('/user')
          window.location.reload()
          this.$store.dispatch('closePopup')
        }).catch(err => {
          firebase.auth().currentUser.delete()
          toast({
            name: err.message,
            seconds: 3,
            type: 'error',
          })}
        )
      }).catch(err => toast('pushToast', {
        name: err.message,
        seconds: 3,
        type: 'error',
      }))
    },
    guest() {
      const auth = firebase.auth()
      auth.signInAnonymously().then(() => {
        this.$store.commit('pushToast', {
          name: this.l['You have successfully signed in as a guest.'],
          seconds: 3,
          type: 'success',
        })
        this.$store.dispatch('createAnonymousUser', auth.currentUser.uid).then(el => {
          this.$store.dispatch('closePopup')
          this.$router.push('/user')
        }).catch(err => {
          auth.currentUser.delete()
        })
      }).catch(err => this.$store.commit('pushToast', {
        name: err.message,
        seconds: 3,
        type: 'error',
      }))
    },
  },
  computed: {
    ...mapState(['lang']),
    ...mapGetters(['platform', 'l', 'isDesktop'])
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
