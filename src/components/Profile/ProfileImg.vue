<template>
  <div @click='click'
    class="ProfileImg shadow"
    :class="{nophoto, enabled}"
    :style='style'
  >
    <Icon v-if="nophoto" icon="user" width="65%"/>
  </div>
</template>

<script>

import IconVue from '../Icon.vue'

import { mapState, mapGetters } from 'vuex'

import utils from '@/utils'
import firebase from 'firebase/app'
import 'firebase/storage'

export default {
  props: ['enable', 'src'],
  components: {
    Icon: IconVue,
  },
  mounted() {
    const errToast = err => this.$store.commit('pushToast', {
      name: err.message,
      seconds: 4,
      type: 'error'
    })
    if (this.enable) {
      utils.bindOptionsToEventListener(this.$el, [
        {
          name: this.l['Change photo'],
          icon: 'pen',
          file: true,
          accept: '.jpg',
          handleFiles: (files, promise) => {
            const file = files[0]
            if (file) {
              const str = this.getFirebaseRefPath

              const ref = firebase.storage().ref(str)
              ref.put(file).then(snap => {
                firebase.storage().ref(str).getDownloadURL().then(url => {
                  firebase.auth().currentUser.updateProfile({
                    photoURL: url,
                  }).then(() => window.location.reload())
                  .catch(errToast)
                  this.$store.dispatch('update', {photoURL: url})
                }).catch(errToast)
              }).catch(errToast)
            }
          },
        },
        {
          name: this.l['Remove photo'],
          icon: 'trash',
          callback: () => {
            this.$store.dispatch('deleteProfilePic')
            this.$store.dispatch('update', {photoURL: ''})
          }
        }
      ], this, 'click')
    }
  },
  methods: {
    click(evt) {
      if (this.enable) evt.stopPropagation()
    },
  },
  computed: {
    ...mapState(['user']),
    ...mapGetters(['l']),
    getFirebaseRefPath() {
      return `images/${this.user.uid}.jpg`
    },
    nophoto() {
      return !this.src
    },
    enabled() {
      return this.enable
    },
    style() {
      if (!this.nophoto)
        return `background-image: url("${this.src}");`
      return {}
    },
  },
}

</script>

<style scoped>

.ProfileImg {
  display: inline-block;
  border-radius: 150px;
  overflow: hidden;
  background-position: center;
  background-size: cover;
}

.nophoto {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  background-color: var(--card);
  color: var(--light-gray);
}

.enabled {
  cursor: pointer;
}

</style>
