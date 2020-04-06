<template>
  <div class="SigninOptions">
    <div class="card cursor rb google" @click="google">
      <span>Sign in with google</span>
    </div>
    <div v-if="!isUpgrading" class="card cursor rb" @click="guest">
      <span>Sign in as a guest</span>
    </div>
    <div class="tac mar">
      <h3>OR</h3>
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

      firebase.auth().signInWithCredential(credential).then(res => {
        const user = res.user
        const toast = (t) => this.$store.commit('pushToast', t)
        const dispatch = this.$store.dispatch
        toast({
          name: 'You have successfully logged in!',
          seconds: 3,
          type: 'success',
        })
        dispatch('createUser', user).then(() => {
          this.$router.push('/user')
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
      this.$store.dispatch('anonymousSignIn')
    },
  },
  computed: {
    ...mapGetters(['layout', 'isDesktopBreakPoint'])
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
  transition-duration: .175s;
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

<style scoped>

.mar {
  margin: 8px;
}

</style>
